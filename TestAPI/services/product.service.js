
module.exports = {
    // Define service name
    name: "products",

    actions: {
        // Define service action that returns the available products
        listProducts(ctx) {
            console.log('in products service, meta = ', ctx.meta)
            return [
                { name: "Apples", price: 5 },
                { name: "Oranges", price: 3 },
                { name: "Bananas", price: 2 }
            ];
        }
    }
}