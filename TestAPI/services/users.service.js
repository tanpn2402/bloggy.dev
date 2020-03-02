"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const DbService = require("../mixins/db.mixin");

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

                        return this.adapter.insert(entity)
                            .then(doc => this.transformDocuments(ctx, {}, doc))
                            .then(user => this.transformEntity(user, true, ctx.meta.token))
                            .then(json => this.entityChanged("created", json, ctx).then(() => json));
                    });
            }
        },

        /**
		 * Login with username & password
		 * 
		 * @actions
		 * @param {Object} user - User credentials
		 * 
		 * @returns {Object} Logged in user with token
		 */
        login: {
            params: {
                user: {
                    type: "object", props: {
                        email: { type: "email" },
                        password: { type: "string", min: 1 }
                    }
                }
            },
            handler(ctx) {
                const { email, password } = ctx.params.user;

                return this.Promise.resolve()
                    .then(() => this.adapter.findOne({ email }))
                    .then(user => {
                        if (!user) {
                            return this.Promise.reject(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found" }]));
                        }

                        return bcrypt.compare(password, user.password).then(res => {
                            if (!res) {
                                return Promise.reject(new MoleculerClientError("Wrong password!", 422, "", [{ field: "password", message: "wrong password" }]));
                            }

                            // Transform user entity (remove password and all protected fields)
                            return this.transformDocuments(ctx, {}, user);
                        });
                    })
                    .then(user => this.transformEntity(user, true, ctx.meta.token));
            }
        },

        /**
		 * Get current user entity.
		 * Auth is required!
		 * 
		 * @actions
		 * 
		 * @returns {Object} User entity
		 */
        me: {
            auth: "required",
            cache: {
                keys: ["#token"]
            },
            handler(ctx) {
                return this.getById(ctx.meta.user._id)
                    .then(user => {
                        if (!user) {
                            return this.Promise.reject(new MoleculerClientError("User not found!", 400));
                        }

                        return this.transformDocuments(ctx, {}, user);
                    })
                    .then(user => this.transformEntity(user, true, ctx.meta.token));
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
                    jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve(decoded);
                    });

                })
                    .then(decoded => {
                        if (decoded.id) {
                            return this.getById(decoded.id);
                        }
                    });
            }
        }
    },

    methods: {
        /**
		 * Generate a JWT token from user entity
		 * 
		 * @param {Object} user 
		 */
        generateJWT(user) {
            const today = new Date();
            const exp = new Date(today);
            exp.setDate(today.getDate() + 60);

            return jwt.sign({
                id: user._id,
                username: user.username,
                exp: Math.floor(exp.getTime() / 1000)
            }, this.settings.JWT_SECRET);
        },

        /**
         * Transform returned user entity. Generate JWT token if neccessary.
         * 
         * @param {Object} user 
         * @param {Boolean} withToken 
         */
        transformEntity(user, withToken, token) {
            if (user) {
                //user.image = user.image || "https://www.gravatar.com/avatar/" + crypto.createHash("md5").update(user.email).digest("hex") + "?d=robohash";
                user.image = user.image || "/assets/images/avt.png";
                if (withToken) {
                    user.token = token || this.generateJWT(user);
                }
            }

            return { user };
        },
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