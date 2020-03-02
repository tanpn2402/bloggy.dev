// index.js
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
                path: '/static',
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
                authentication: true,
                authorization: true,
                bodyParsers: {
                    json: true,
                    urlencoded: true
                },
                aliases: {
                    "GET /products": "products.listProducts",
                    "POST /products": "products.listProducts"
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
        ]
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
            console.log(ctx);
            let auth = req.headers["authorization"];
            if (auth && auth.startsWith("Bearer")) {
                let token = auth.slice(7);

                console.log('authorize token = ', token)
                // Check the token
                if (token == "123456") {
                    // Set the authorized user entity to `ctx.meta`
                    // ctx.meta.user = { id: 1, name: "John Doe" };
                    return Promise.resolve(ctx);

                } else {
                    // Invalid token
                    return Promise.reject(new ERRORS.UnAuthorizedError(ERRORS.ERR_INVALID_TOKEN));
                }

            } else {
                // No token
                return Promise.reject(new ERRORS.UnAuthorizedError(ERRORS.ERR_NO_TOKEN));
            }
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