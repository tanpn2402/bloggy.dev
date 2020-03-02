// index.js
const ApiGateway = require("moleculer-web");
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
                path: '/api',
                aliases: {
                    // When the "GET /products" request is made the "listProducts" action of "products" service is executed
                    "GET /products": "products.listProducts"
                }
            }
        ]
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