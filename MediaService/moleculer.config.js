"use strict";

const os = require("os");

// moleculer.config.js
module.exports = {
    nodeID: os.hostname().toLowerCase() + "-" + process.pid,
    logger: true,
    logLevel: "debug",

    transporter: "nats://localhost:4222",
    requestTimeout: 5 * 1000,

    circuitBreaker: {
        enabled: true
    },

    metrics: true
};
