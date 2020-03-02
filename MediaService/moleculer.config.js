"use strict";

// moleculer.config.js
module.exports = {
    nodeID: "node-test-1",
    logger: true,
    logLevel: "debug",

    transporter: "nats://localhost:4222",
    requestTimeout: 5 * 1000,

    circuitBreaker: {
        enabled: true
    },

    metrics: true
};
