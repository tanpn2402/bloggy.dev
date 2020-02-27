"use strict";

let fs = require("fs");
let path = require("path");
const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");

const broker = new ServiceBroker({
	transporter: "NATS",
	metrics: true
});

// Load other services

let brokerOptions = {
	name: "api",
	mixins: [ApiGateway],

	settings: {
		port: process.env.PORT || 3000,

		// HTTPS server with certificate
		https: {
			key: fs.readFileSync(path.join(__dirname, "/../ssl/key.pem")),
			cert: fs.readFileSync(path.join(__dirname, "/../ssl/cert.pem"))
		},

		routes: [{
			path: "/api",
			whitelist: [
				// Access to any actions in all services
				"*"
			],
			aliases: {
				"REST products": "products",
				"POST hello": "greeter.welcome"
			}
		}],

		// Serve assets from "public" folder
		assets: {
			folder: "public"
		}
	}
}

broker.createService(brokerOptions);

module.exports = brokerOptions;
