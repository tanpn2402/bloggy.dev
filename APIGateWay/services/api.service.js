"use strict";

let fs = require("fs");
let path = require("path");
const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");
const { ApolloService } = require("moleculer-apollo-graph");


const broker = new ServiceBroker({
	transporter: "NATS",
	metrics: true
});

// Load other services

let brokerOptions = {
	name: "api",
	mixins: [
		ApiGateway,
		// GraphQL Apollo Server
		ApolloService({
			// API Gateway route options
			routeOptions: {
				path: "/graphql",
				cors: true,
				mappingPolicy: "restrict"
			},

			// https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
			serverOptions: {
			}
		})
	],

	events: {
		"graphql.schema.updated"({ schema }) {
			this.logger.info("Generated GraphQL schema:\n\n" + schema);
		},
	},

	settings: {
		port: process.env.PORT || 3000,

		// HTTPS server with certificate
		// https: {
		// 	key: fs.readFileSync(path.join(__dirname, "/../ssl/key.pem")),
		// 	cert: fs.readFileSync(path.join(__dirname, "/../ssl/cert.pem"))
		// },

		routes: [
			{
				path: "/api",
				whitelist: [
					// Access to any actions in all services
					"*"
				],
				aliases: {
					"REST products": "products",
					"POST hello": "greeter.welcome"
				}
			}
		],

		// Serve assets from "public" folder
		assets: {
			folder: path.join(__dirname, "/../../WebClient/build"),
			options: {
				index: "index.html"
			}
		}
	}
};

broker.createService(brokerOptions);

broker.createService({
	name: "greeter",

	actions: {
		hello: {
			graphql: {
				query: "hello: String!",
			},
			handler() {
				return "Hello Moleculer!";
			},
		},
		welcome: {
			graphql: {
				mutation: `
					welcome(
						name: String!
					): String!
				`,
			},
			handler(ctx) {
				return `Hello ${ctx.params.name}`;
			},
		},
		update: {
			graphql: {
				subscription: "update: String!",
				tags: ["TEST"],
			},
			handler(ctx) {
				return ctx.params.payload;
			},
		}
	},
});

module.exports = brokerOptions;
