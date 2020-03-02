module.exports = {
    name: "greeter",
    settings: {
        type: `
            """
            This type describes a Article entity.
            """			
            type Article {
                _id: String!
                title: String!
                slug: User!
                description: String
                body: String
                tagList: [String]
                createdAt: Timestamp
                updatedAt: Timestamp
                favorited: Boolean
                favoritesCount: Int
            }
        `,
    },
    actions: {
        hello: {
            graphql: {
                query: "hello: String"
            },
            handler(ctx) {
                return "Hello Moleculer!"
            }
        },
        welcome: {
            params: {
                name: "string"
            },
            graphql: {
                mutation: "welcome(name: String!): String"
            },
            handler(ctx) {
                return `Hello ${ctx.params.name}`;
            }
        },
        add: {
            params: {
                a: "number",
                b: "number"
            },
            graphql: {
                mutation: `
                    add(a: Int!, b: Int!): Int
                `
            },
            handler(ctx) {
                const { a, b } = ctx.params;
                return ctx.call("math.add", { a, b })
                    .then(res => {
                        return res;
                    });
            }
        },
        article: {
            params: {
                title: "string",
                description: "string",
                tagList: "array"
            },
            graphql: {
                mutation: `
                    article(title: String, description: String): [Article]
                `
            },
            handler(ctx) {
                const { title, description } = ctx.params;
                return ctx.call("articles.list", { title, description })
                    .then(res => {
                        return res;
                    });
            }
        }
    }
};
