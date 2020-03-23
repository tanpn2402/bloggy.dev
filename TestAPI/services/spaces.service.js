"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");
const slug = require("slug");

module.exports = {
    name: "spaces",
    mixins: [DbService("spaces")],

	/**
	 * Default settings
	 */
    settings: {
        // Populates
        populates: {
            author(ids, spaces, rule, ctx) {
                return this.Promise.all(
                    spaces.map(space => ctx.call("users.get", { id: space.author }).then(res => space.author = {
                        _id: space.author,
                        username: res.username,
                        email: res.email,
                        image: res.image || '/assets/images/default/smiley-cyrus.jpg'
                    }))
                );
            },
            followCount(ids, spaces, rule, ctx) {
                return this.Promise.all(spaces.map(space => ctx.call("follow_spaces.count", { space: space._id.toString() }).then(count => space.followsCount = count)));
            },
            followed(ids, spaces, rule, ctx) {
                if (ctx.meta.user)
                    return this.Promise.all(
                        spaces.map(space => ctx.call("follow_spaces.has", { space: space._id.toString(), user: ctx.meta.user._id.toString() }).then(res => space.followed = res))
                    );
                else {
                    spaces.forEach(space => space.followed = false);
                    return this.Promise.resolve();
                }
            },
        },

        // Validation schema for new entities
        entityValidator: {
            name: { type: "string", min: 1 },
            description: { type: "string", min: 1 },
            type: { type: "string", min: 1 },
            visibility: { type: "string", min: 1 },
        },

        // Base path
        rest: "spaces/"
    },

	/**
	 * Actions
	 */
    actions: {
        /**
		 * Create a new space.
		 * Auth is required!
		 * 
		 * @actions
		 * @param {Object} article - Article entity
		 * 
		 * @returns {Object} Created entity
		 */
        create: {
            auth: "required",
            rest: 'POST /',
            params: {
                space: { type: "object" }
            },
            handler(ctx) {
                let entity = ctx.params.space;
                return this.validateEntity(entity)
                    .then(() => {
                        entity.slug = slug(entity.name, { lower: true }) + "-" + (Math.random() * Math.pow(36, 6) | 0).toString(36);
                        entity.author = ctx.meta.user._id.toString();
                        entity.createdAt = new Date();
                        entity.updatedAt = new Date();

                        return this.adapter.insert(entity)
                            .then(entity => this.transformResult(ctx, entity, ctx.meta.user));
                    });
            }
        },

        /**
		 * List articles with pagination.
		 * 
		 * @actions
		 * @param {String} type - Filter for 'type' [type=other,music]
		 * @param {String} author - Filter for author username
		 * @param {Number} limit - Pagination limit
		 * @param {Number} offset - Pagination offset
		 * 
		 * @returns {Object} List of articles
		 */
        list: {
            rest: "GET /",
            cache: {
                keys: ["#token", "tag", "author", "favorited", "limit", "offset"]
            },
            params: {
                author: { type: "string", optional: true },
                name: { type: "string", optional: true },
                type: { type: "string", optional: true },
                limit: { type: "number", optional: true, convert: true },
                offset: { type: "number", optional: true, convert: true },
            },
            handler(ctx) {
                const limit = ctx.params.limit ? Number(ctx.params.limit) : 20;
                const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;

                let params = {
                    limit,
                    offset,
                    sort: ["-createdAt"],
                    populate: ["author", "followCount", "followed"],
                    query: {}
                };
                let countParams;

                if (ctx.params.type) {
                    params.query.type = { "$in": ctx.params.type.split(',') };
                }

                return this.Promise.resolve()
                    .then(() => {
                        if (ctx.params.author) {
                            return ctx.call("users.find", { query: { username: ctx.params.author } })
                                .then(users => {
                                    if (users.length == 0) {
                                        return this.Promise.reject(new MoleculerClientError("Author not found"));
                                    }

                                    params.query.author = users[0]._id;
                                });
                        }
                    })
                    .then(() => {
                        countParams = Object.assign({}, params);
                        // Remove pagination params
                        if (countParams && countParams.limit)
                            countParams.limit = null;
                        if (countParams && countParams.offset)
                            countParams.offset = null;
                    })
                    .then(() => this.Promise.all([
                        // Get rows
                        this.adapter.find(params),

                        // Get count of all rows
                        this.adapter.count(countParams)
                    ]))
                    .then(res => {
                        return this.transformDocuments(ctx, params, res[0])
                            .then(docs => this.transformResult(ctx, docs, ctx.meta.user))
                            .then(r => {
                                r.spacesCount = res[1];
                                return r;
                            });
                    });
            }
        },

        /**
		 * Get a space by id
		 * 
		 * @actions
		 * @param {String} id - space id
		 * 
		 * @returns {Object} Space entity
		 */
        get: {
            rest: 'GET /:id',
            cache: {
                keys: ["#token", "id"]
            },
            params: {
                id: { type: "string" }
            },
            handler(ctx) {
                return this.getById(ctx.params.id)
                    .then(entity => {
                        if (!entity)
                            return this.Promise.reject(new MoleculerClientError("Space not found!", 404));

                        return entity;
                    })
                    .then(doc => this.transformDocuments(ctx, { populate: ["author", "followCount", "followed"] }, doc))
                    .then(entity => this.transformResult(ctx, entity, ctx.meta.user));
            }
        },

        /**
		 * Get recommended spaces
		 * 
		 * @actions
		 * 
		 * @returns {Object} Space entity
		 */
        recommended: {
            cache: {
                // keys: ["id"]
            },
            params: {
                limit: { type: "number", optional: true, convert: true },
                offset: { type: "number", optional: true, convert: true },
            },
            handler(ctx) {
                const limit = ctx.params.limit ? Number(ctx.params.limit) : 20;
                const offset = ctx.params.offset ? Number(ctx.params.offset) : 0;

                let params = {
                    limit,
                    offset,
                    sort: ["-createdAt"],
                    query: {}
                };
                let countParams;

                return this.getById(ctx.params.id)
                    .then(() => {
                        countParams = Object.assign({}, params);
                        // Remove pagination params
                        if (countParams && countParams.limit)
                            countParams.limit = null;
                        if (countParams && countParams.offset)
                            countParams.offset = null;
                    })
                    .then(() => this.Promise.all([
                        // Get rows
                        this.adapter.find(params),

                        // Get count of all rows
                        this.adapter.count(countParams)

                    ])).then(res => {
                        return this.transformDocuments(ctx, params, res[0])
                            .then(docs => this.transformResult(ctx, docs, ctx.meta.user))
                            .then(r => {
                                r.spacesCount = res[1];
                                return r;
                            });
                    });
            }
        },


		/**
		 * get followed spaces
		 * 
		 * @actions
		 * 
		 * @param {String} user - user ID
		 */
        followed: {
            cache: {
                // keys: ["id"]
            },
            params: {
                user: { type: "string", optional: true },
                limit: { type: "number", optional: true, convert: true },
                offset: { type: "number", optional: true, convert: true },
            },
            handler(ctx) {
                return ctx.call("users.getById", { _id: ctx.params.user })
                    .then(user => {
                        if (!user) {
                            return this.Promise.reject(new MoleculerClientError("User not found"));
                        }

                        return ctx.call("follow_spaces.followed", { ...ctx.params });
                    });
            }
        },

		/**
		 * Follow space
		 * 
		 * @actions
		 * 
		 * @param {String} space - space_id
		 */
        follow: {
            auth: "required",
            params: {
                space: { type: "any" },
            },
            handler(ctx) {
                return this.Promise.resolve(ctx.params.space)
                    .then(space_id => this.getById(space_id))
                    .then(space => {
                        if (!space) {
                            return this.Promise.reject(new MoleculerClientError("Space not found!", 404));
                        }

                        return ctx.call("follow_spaces.add", { user: ctx.meta.user._id.toString(), space: space._id.toString() }).then(() => space)
                    })
                    .then(space => this.transformDocuments(ctx, {}, space))
                    .then(entity => this.transformResult(ctx, entity, ctx.meta.user));
            }
        },

		/**
		 * Unfollow space
		 * 
		 * @actions
		 * 
		 * @param {String} space - space_id
		 */
        unfollow: {
            auth: "required",
            params: {
                space: { type: "any" },
            },
            handler(ctx) {
                return this.Promise.resolve(ctx.params.space)
                    .then(space_id => this.getById(space_id))
                    .then(space => {
                        if (!space) {
                            return this.Promise.reject(new MoleculerClientError("Space not found!", 404));
                        }

                        return ctx.call("follow_spaces.delete", { user: ctx.meta.user._id.toString(), space: space._id.toString() }).then(() => space)
                    })
                    .then(space => this.transformDocuments(ctx, {}, space))
                    .then(entity => this.transformResult(ctx, entity, ctx.meta.user));
            }
        },
    },

	/**
	 * Methods
	 */
    methods: {
        /**
         * Transform the result entities to follow the RealWorld API spec
         * 
         * @param {Context} ctx 
         * @param {Array} entities 
         * @param {Object} user - Logged in user
         */
        transformResult(ctx, entities, user) {
            if (Array.isArray(entities)) {
                return this.Promise.all(entities, item => this.transformEntity(ctx, item, user))
                    .then(spaces => ({ spaces }));
            } else {
                return this.transformEntity(ctx, entities, user)
                    .then(spaces => ({ spaces }));
            }
        },

		/**
		 * Transform a result entity to follow the RealWorld API spec 
		 * 
		 * @param {Context} ctx 
		 * @param {Object} entity 
		 * @param {Object} user - Logged in user
		 */
        transformEntity(ctx, entity, user) {
            if (!entity) return this.Promise.resolve();

            return this.Promise.resolve(entity);
        },

        /**
		 * Find an article by slug
		 * 
		 * @param {String} slug - Article slug
		 * 
		 * @results {Object} Promise<Article
		 */
        findBySlug(slug) {
            return this.adapter.findOne({ slug });
        },
    },

    events: {

    }
};