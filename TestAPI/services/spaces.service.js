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
		 * @param {String} tag - Filter for 'tag'
		 * @param {String} author - Filter for author ID
		 * @param {String} favorited - Filter for favorited author
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
                name: { type: "string", optional: true },
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

                return this.Promise.resolve()
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
		 * Delete a following record
		 * 
		 * @actions
		 * 
		 * @param {String} user - Follower username
		 * @param {String} follow - Followee username
		 * @returns {Number} Count of removed records
		 */
        delete: {
            params: {
                user: { type: "string" },
                follow: { type: "string" },
            },
            handler(ctx) {
                const { follow, user } = ctx.params;
                return this.findByFollowAndUser(follow, user)
                    .then(item => {
                        if (!item)
                            return this.Promise.reject(new MoleculerClientError("User has not followed yet"));

                        return this.adapter.removeById(item._id)
                            .then(json => this.entityChanged("removed", json, ctx).then(() => json));
                    });
            }
        }
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
        }
    },

    events: {

    }
};