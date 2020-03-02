
module.exports = {
    // Define service name
    name: "math",

    actions: {
        add(ctx) {
            return Number(ctx.params.a) + Number(ctx.params.b);
        },
    }
}