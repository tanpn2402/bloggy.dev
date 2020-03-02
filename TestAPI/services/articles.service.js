"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const { ForbiddenError } = require("moleculer-web").Errors;

const _ = require("lodash");
const slug = require("slug");
const DbService = require("../mixins/db.mixin");

module.exports = {
    name: "articles",
    mixins: [DbService("articles")],

	/**
	 * Default settings
	 */
    settings: {
        fields: ["_id", "title", "slug", "description", "body", "tagList", "createdAt", "updatedAt", "favorited", "favoritesCount", "author", "comments"],

        // Populates
        populates: {
            comments: {
                action: "comments.get",
                params: {
                    fields: ["_id", "body", "author"],
                    populates: ["author"]
                }
            },
            author(ids, articles, rule, ctx) {
                return this.Promise.all(
                    articles.map(article => ctx.call("users.get", { id: article.author }).then(res => article.author = {
                        username: res.username,
                        email: res.email,
                        image: res.image || '/assets/images/avt.png'
                    }))
                );
            },
            favorited(ids, articles, rule, ctx) {
                if (ctx.meta.user)
                    return this.Promise.all(
                        articles.map(article => ctx.call("favorites.has", { article: article._id.toString(), user: ctx.meta.user._id.toString() }).then(res => article.favorited = res))
                    );
                else {
                    articles.forEach(article => article.favorited = false);
                    return this.Promise.resolve();
                }
            },
            favoritesCount(ids, articles, rule, ctx) {
                return this.Promise.all(articles.map(article => ctx.call("favorites.count", { article: article._id.toString() }).then(count => article.favoritesCount = count)));
            }
        },

        // Validation schema for new entities
        entityValidator: {
            title: { type: "string", min: 1 },
            description: { type: "string", min: 1 },
            body: { type: "string", min: 1 },
            tagList: { type: "array", items: "string", optional: true },
        }
    },

	/**
	 * Actions
	 */
    actions: {

        /**
		 * Create a new article.
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
                article: { type: "object" }
            },
            handler(ctx) {
                let entity = ctx.params.article;
                return this.validateEntity(entity)
                    .then(() => {
                        entity.slug = slug(entity.title, { lower: true }) + "-" + (Math.random() * Math.pow(36, 6) | 0).toString(36);
                        entity.author = ctx.meta.user._id.toString();
                        entity.createdAt = new Date();
                        entity.updatedAt = new Date();

                        return this.adapter.insert(entity)
                            .then(doc => this.transformDocuments(ctx, { populate: ["author", "favorited", "favoritesCount"] }, doc))
                            .then(entity => this.transformResult(ctx, entity, ctx.meta.user))
                            .then(json => this.entityChanged("created", json, ctx).then(() => json));
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
                tag: { type: "string", optional: true },
                author: { type: "string", optional: true },
                favorited: { type: "string", optional: true },
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
                    populate: ["author", "favorited", "favoritesCount"],
                    query: {}
                };
                let countParams;

                if (ctx.params.tag)
                    params.query.tagList = { "$in": [ctx.params.tag] };

                return this.Promise.resolve()
                    .then(() => {
                        if (ctx.params.author) {
                            return ctx.call("users.find", { query: { username: ctx.params.author } })
                                .then(users => {
                                    if (users.length == 0)
                                        return this.Promise.reject(new MoleculerClientError("Author not found"));

                                    params.query.author = users[0]._id;
                                });
                        }
                        if (ctx.params.favorited) {
                            return ctx.call("users.find", { query: { username: ctx.params.favorited } })
                                .then(users => {
                                    if (users.length == 0)
                                        return this.Promise.reject(new MoleculerClientError("Author not found"));

                                    return users[0]._id;
                                })
                                .then(user => {
                                    return ctx.call("favorites.find", { fields: ["article"], query: { user } })
                                        .then(list => {
                                            params.query._id = { $in: list.map(o => o.article) };
                                        });
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

                    ])).then(res => {
                        return this.transformDocuments(ctx, params, res[0])
                            .then(docs => this.transformResult(ctx, docs, ctx.meta.user))
                            .then(r => {
                                r.articlesCount = res[1];
                                return r;
                            });
                    });
            }
        },

        /**
		 * List articles from followed authors.
		 * Auth is required!
		 * 
		 * @actions
		 * @param {Number} limit - Pagination limit
		 * @param {Number} offset - Pagination offset
		 * 
		 * @returns {Object} List of articles
		 */
        feed: {
            auth: "required",
            cache: {
                keys: ["#token", "limit", "offset"]
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
                    populate: ["author", "favorited", "favoritesCount"],
                    query: {}
                };
                let countParams;

                return this.Promise.resolve()
                    // .then(() => {
                    //     return ctx.call("follows.find", { fields: ["follow"], query: { user: ctx.meta.user._id.toString() } })
                    //         .then(list => {
                    //             const authors = _.uniq(_.compact(_.flattenDeep(list.map(o => o.follow))));
                    //             params.query.author = { "$in": authors };
                    //         });
                    // })
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
                                r.articlesCount = res[1];
                                return r;
                            });
                    });
            }
        },

		/**
		 * Get list of available tags
		 * 
		 * @returns {Object} Tag list
		 */
        tags: {
            cache: {
                keys: []
            },
            handler(ctx) {
                return this.Promise.resolve()
                    .then(() => this.adapter.find({ fields: ["tagList"], sort: ["createdAt"] }))
                    .then(list => {
                        return _.uniq(_.compact(_.flattenDeep(list.map(o => o.tagList))));
                    })
                    .then(tags => ({ tags }));
            }
        },
    },

	/**
	 * Methods
	 */
    methods: {
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
                    .then(articles => ({ articles }));
            } else {
                return this.transformEntity(ctx, entities, user)
                    .then(article => ({ article }));
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
        "cache.clean.articles"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.users"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.comments"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.follows"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        },
        "cache.clean.favorites"() {
            if (this.broker.cacher)
                this.broker.cacher.clean(`${this.name}.*`);
        }
    }
};