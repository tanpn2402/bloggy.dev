// index.js
const _ = require("lodash");
const ApiGateway = require("moleculer-web");
const ERRORS = require("moleculer-web").Errors;
const { ApolloService } = require("moleculer-apollo-server");
let IO = require("socket.io");

module.exports = {
    // Define service name
    name: "gateway",
    // Load the HTTP server
    mixins: [
        ApiGateway,
        ApolloService({
            typeDefs: ``,
            resolvers: {},
            routeOptions: {
                path: "/graphql",
                cors: true,
                mappingPolicy: "restrict"
            }
        })
    ],

    settings: {
        routes: [
            {
                path: '/assets',
                authentication: false,
                authorization: false,
                aliases: {
                    /**
                     * get image
                     * @param {*} req 
                     * @param {*} res 
                     */
                    "GET /images/:file"(req, res) {

                        const filename = "avatar-123.jpeg";

                        req.$ctx.call("image.stream", { filename })
                            .then(stream => {
                                res.writeHead(200, {
                                    'Content-Type': 'image/jpeg'
                                });
                                stream.pipe(res);
                            })
                    }
                }
            },
            {
                path: '/api',
                // authentication: true,
                authorization: true,
                bodyParsers: {
                    json: true,
                    urlencoded: true
                },
                // Set CORS headers
                cors: true,
                // Disable to call not-mapped actions
                mappingPolicy: "restrict",

                aliases: {
                    "GET /products": "products.listProducts",
                    "POST /products": "products.listProducts",

                    // Login
                    "POST /users/login": "users.login",

                    // Users
                    "REST /users": "users",

                    // Current user
                    "GET /user": "users.me",

                    // Articles
                    "GET /articles/feed": "articles.feed",
                    "REST /articles": "articles",
                    "GET /tags": "articles.tags",
                },
                onBeforeCall(ctx, route, req, res) {
                    this.logger.info("onBeforeCall in protected route");
                    this.logger.info("user meta = ", ctx.meta.user);
                    ctx.meta.authToken = req.headers["authorization"];
                },

                onAfterCall(ctx, route, req, res, data) {
                    this.logger.info("onAfterCall in protected route");
                    res.setHeader("X-Custom-Header", "Authorized path");

                    return data;
                },
            }
        ],

        onError(req, res, err) {
            // Return with the error as JSON object
            res.setHeader("Content-type", "application/json; charset=utf-8");
            res.writeHead(err.code || 500);

            if (err.code === 422) {
                let o = {};
                err.data.forEach(e => {
                    let field = e.field.split(".").pop();
                    o[field] = e.message;
                });

                res.end(JSON.stringify({
                    errorCode: err.code,
                    errors: o
                }, null, 2));
            } else {
                const errObj = _.pick(err, ["name", "message", "code", "type", "data"]);
                res.end(JSON.stringify(errObj, null, 2));
            }
            this.logResponse(req, res, err ? err.ctx : null);
        }

    },

    methods: {
        /**
         * Please note that authenticate is called before authorize
         * @param {*} ctx 
         * @param {*} route 
         * @param {*} req 
         * @param {*} res 
         */
        authenticate(ctx, route, req, res) {
            let accessToken = req.body["access_token"];
            console.log('authenticate access_token = ', accessToken);

            if (accessToken) {
                if (accessToken === "123456") {
                    // valid credentials
                    return Promise.resolve({ id: 1, username: "john.doe", name: "John Doe", data: '123' });
                } else {
                    // invalid credentials
                    return Promise.reject(new ERRORS.UnAuthorizedError(ERRORS.ERR_NO_TOKEN));
                }
            } else {
                // anonymous user
                return Promise.resolve(null);
            }
        },


		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
        authorize(ctx, route, req) {
            let token;
            let auth = req.headers["authorization"];

            if (auth && auth.startsWith("Bearer")) {
                token = auth.slice(7);
            }
            else if (auth && auth.startsWith("Token")) {
                token = auth.slice(6);
            }

            return this.Promise.resolve(token)
                .then(token => {
                    // Verify JWT token
                    return ctx.call("users.resolveToken", { token })
                        .then(user => {
                            if (user) {
                                this.logger.info("Authenticated via JWT: ", user);
                                ctx.meta.user = user;
                                ctx.meta.token = token;
                            }
                            return user;
                        })
                        .catch(err => {
                            return null;
                        });
                })
                .then(user => {
                    if (req.$endpoint.action.auth == "required" && !user) {
                        return this.Promise.reject(new ERRORS.UnAuthorizedError(ERRORS.ERR_NO_TOKEN));
                    }
                })
        },
    },

    started() {
        // Create a Socket.IO instance, passing it our server
        this.io = IO.listen(this.server);

        // Add a connect listener
        this.io.on("connection", client => {
            this.logger.info("Client connected via websocket!");

            client.on("call", ({ action, params, opts }, done) => {
                this.logger.info("Received request from client! Action:", action, ", Params:", params);

                this.broker.call(action, params, opts)
                    .then(res => {
                        if (done)
                            done(res);
                    })
                    .catch(err => this.logger.error(err));
            });

            client.on("disconnect", () => {
                this.logger.info("Client disconnected");
            });

        });
    }
}