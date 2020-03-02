"use strict";

// const DbService = require("moleculer-db");
const DbService = require("../mixins/db.mixin");
const bcrypt = require("bcrypt");
const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
    name: "users",

    // Mixin DB service into (current) 'users' service
    mixins: [DbService("users")],

    settings: {
        /** Secret for JWT */
        JWT_SECRET: process.env.JWT_SECRET || "jwt-conduit-secret-qwe123poi908",

        /** Public fields */
        fields: ["_id", "username", "email", "bio", "image"],

        /** Validator schema for entity */
        entityValidator: {
            username: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+$/ },
            password: { type: "string", min: 6 },
            email: { type: "email" },
            bio: { type: "string", optional: true },
            image: { type: "string", optional: true },
        },

        /** Base path */
        rest: "/users/"
    },

    actions: {

        create: {
            rest: "POST /",
            params: {
                user: { type: "object" }
            },
            handler(ctx) {
                let entity = ctx.params.user;
                return this.validateEntity(entity)
                    .then(() => {
                        if (entity.username)
                            return this.adapter.findOne({ username: entity.username })
                                .then(found => {
                                    if (found)
                                        return Promise.reject(new MoleculerClientError("Username is exist!", 422, "", [{ field: "username", message: "is exist" }]));

                                });
                    })
                    .then(() => {
                        if (entity.email)
                            return this.adapter.findOne({ email: entity.email })
                                .then(found => {
                                    if (found)
                                        return Promise.reject(new MoleculerClientError("Email is exist!", 422, "", [{ field: "email", message: "is exist" }]));
                                });

                    })
                    .then(() => {
                        entity.password = bcrypt.hashSync(entity.password, 10);
                        entity.bio = entity.bio || "";
                        entity.image = entity.image || null;
                        entity.createdAt = new Date();

                        return this.adapter.insert(entity);
                    });
            }
        },

        resolveToken: {
            cache: {
                keys: ["token"],
                ttl: 60 * 60 // 1 hour
            },
            params: {
                token: "string"
            },
            handler(ctx) {
                return new this.Promise((resolve, reject) => {
                    if (ctx.params.token === '123456') {
                        resolve({
                            id: 1,
                            username: 'tan'
                        })
                    } else {
                        reject('INVALID_TOKEN');
                    }
                })
            }
        }

    },

    afterConnected() {
        this.logger.info("Connected successfully");
    },

    entityCreated(json, ctx) {
        this.logger.info("New entity created!");
    },

    entityUpdated(json, ctx) {
        // You can also access to Context
        this.logger.info(`Entity updated by '${ctx.meta.user.name}' user!`);
    },

    entityRemoved(json, ctx) {
        this.logger.info("Entity removed", json);
    },
}