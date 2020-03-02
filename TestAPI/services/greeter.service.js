module.exports = {
    name: "greeter",

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
        }
    }
};
