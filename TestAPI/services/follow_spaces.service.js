"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");

module.exports = {
    name: "follow_spaces",
    mixins: [DbService("follow_spaces")],

	/**
	 * Default settings
	 */
    settings: {
        // Populates
        populates: {
            spaceInfo(ids, elements, rule, ctx) {
                return this.Promise.all(
                    elements.map(e => ctx.call("spaces.get", { id: e.space.toString() })
                        .then(res => e.space = res.spaces)
                    )
                );
            }
        }
    },

	/**
	 * Actions
	 */
    actions: {

		/**
		 * Create a new follow_space record
		 * 
		 * @actions
		 * 
		 * @param {String} user - user_id
		 * @param {String} space - space_id
		 * @returns {Object} Created following record
		 */
        add: {
            params: {
                space: { type: "string" },
                user: { type: "string" },
            },
            handler(ctx) {
                const { space, user } = ctx.params;
                return this.findBySpaceAndUser(space, user)
                    .then(item => {
                        if (item)
                            return this.Promise.reject(new MoleculerClientError("User has already followed"));

                        return this.adapter.insert({ user, space, createdAt: new Date() })
                            .then(json => this.entityChanged("created", json, ctx).then(() => json));
                    });
            }
        },

		/**
		 * Delete a following record
		 * 
		 * @actions
		 * 
		 * @param {String?} space - space ID
		 * @param {String?} user - user ID
		 * @returns {Number} Count of removed records
		 */
        delete: {
            params: {
                space: { type: "string" },
                user: { type: "string" },
            },
            handler(ctx) {
                const { space, user } = ctx.params;
                return this.findBySpaceAndUser(space, user)
                    .then(item => {
                        if (!item)
                            return this.Promise.reject(new MoleculerClientError("User has not followed yet"));

                        return this.adapter.removeById(item._id)
                            .then(json => this.entityChanged("removed", json, ctx).then(() => json));
                    });
            }
        },

		/**
		 * Check the given 'follow' user is followed by 'user' user.
		 * 
		 * @actions
		 * 
		 * @param {String?} space - space ID
		 * @param {String?} user - user ID
		 * @returns {Boolean} 
		 */
        has: {
            cache: {
                keys: ["article", "user"]
            },
            params: {
                space: { type: "string" },
                user: { type: "string" },
            },
            handler(ctx) {
                return this.findBySpaceAndUser(ctx.params.space, ctx.params.user)
                    .then(item => !!item);
            }
        },

		/**
		 * Count of following.
		 * 
		 * @actions
		 * 
		 * @param {String?} space - space ID
		 * @param {String?} user - user ID
		 * @returns {Number}
		 */
        count: {
            cache: {
                keys: ["space", "user"]
            },
            params: {
                space: { type: "string", optional: true },
                user: { type: "string", optional: true },
            },
            handler(ctx) {
                let query = {};
                if (ctx.params.space)
                    query = { space: ctx.params.space };

                if (ctx.params.user)
                    query = { user: ctx.params.user };

                return this.adapter.count({ query });
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
                keys: ["space", "user"]
            },
            params: {
                user: { type: "string", optional: true },
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
                    populate: ["spaceInfo"],
                    query: { user: ctx.params.user }
                }

                let countParams;

                return this.Promise.resolve(ctx.params.user)
                    .then(() => {
                        countParams = Object.assign({}, params);
                        // Remove pagination params
                        if (countParams && countParams.limit)
                            countParams.limit = null;
                        if (countParams && countParams.offset)
                            countParams.offset = null;
                    })
                    .then(() => this.Promise.all([
                        this.adapter.find(params),
                        this.adapter.count(countParams)
                    ]))
                    .then(res => {
                        return this.transformDocuments(ctx, params, res[0])
                            .then(docs => ({
                                spaces: docs.reduce((obj, curr) => {
                                    return obj.concat(curr.space);
                                }, [])
                            }))
                            .then(r => {
                                r.spacesCount = res[1];
                                return r;
                            });
                    });
            }
        }
    },

	/**
	 * Methods
	 */
    methods: {
		/**
		 * Find the first following record by 'follow' or 'user' 
		 * @param {String} follow - Followee username
		 * @param {String} user - Follower username
		 */
        findBySpaceAndUser(space, user) {
            return this.adapter.findOne({ space, user });
        },
    },

    events: {
        // "cache.clean.follows"() {
        //     if (this.broker.cacher)
        //         this.broker.cacher.clean(`${this.name}.*`);
        // },
        // "cache.clean.users"() {
        //     if (this.broker.cacher)
        //         this.broker.cacher.clean(`${this.name}.*`);
        // }
    }
};