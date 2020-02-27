"use strict";

const DbService = require("moleculer-db");



module.exports = {
    name: "products",
    // mixins: [DbService]
    settings: {
        // Base path
        rest: "products/"
    },

    actions: {
        list: {
            // Expose as "/api/v2/posts/"
            rest: "GET /",
            handler(ctx) {
                return 'GET /'
            }
        },

        get: {
            // Expose as "/api/v2/posts/:id"
            rest: "GET /:id",
            handler(ctx) {
                return 'GET /:id'
            }
        },

        create: {
            rest: "POST /",
            handler(ctx) {
                return 'POST /'
            }
        },

        update: {
            rest: "PUT /:id",
            handler(ctx) {
                return 'PUT /:id'
            }
        },

        remove: {
            rest: "DELETE /:id",
            handler(ctx) {
                return 'DELETE /:id'
            }
        }
    }
};