"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("../mixins/db.mixin");


module.exports = {
    name: "favorites",
    mixins: [DbService("favorites")],

	/**
	 * Default settings
	 */
    settings: {

    },

	/**
	 * Actions
	 */
    actions: {

		/**
		 * Check the given 'article' is followed by 'user'.
		 * 
		 * @actions
		 * 
		 * @param {String} article - Article ID
		 * @param {String} user - User ID
		 * @returns {Boolean}
		 */
        has: {
            cache: {
                keys: ["article", "user"]
            },
            params: {
                article: { type: "string" },
                user: { type: "string" },
            },
            handler(ctx) {
                const { article, user } = ctx.params;
                return this.findByArticleAndUser(article, user)
                    .then(item => !!item);
            }
        },

		/**
		 * Count of favorites.
		 * 
		 * @actions
		 * 
		 * @param {String?} article - Article ID
		 * @param {String?} user - User ID
		 * @returns {Number}
		 */
        count: {
            cache: {
                keys: ["article", "user"]
            },
            params: {
                article: { type: "string", optional: true },
                user: { type: "string", optional: true },
            },
            handler(ctx) {
                let query = {};
                if (ctx.params.article)
                    query = { article: ctx.params.article };

                if (ctx.params.user)
                    query = { user: ctx.params.user };

                return this.adapter.count({ query });
            }
        },
    },

	/**
	 * Methods
	 */
    methods: {
		/**
		 * Find the first favorite record by 'article' or 'user' 
		 * @param {String} article - Article ID
		 * @param {String} user - User ID
		 */
        findByArticleAndUser(article, user) {
            return this.adapter.findOne({ article, user });
        },
    },

    events: {
        "cache.clean.favorites"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.users"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.articles"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        }
    }
};