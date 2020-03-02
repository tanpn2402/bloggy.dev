var fs = require('fs');

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}


module.exports = {
    // Define service name
    name: "image",

    actions: {
        get(ctx) {
            let d = base64_encode('./assets/images/index.jpeg');

            // ctx.meta.$responseType = "image/jpeg";
            // ctx.meta.$contentLength = d.length;
            // ctx.meta.$responseHeaders = {
            //     "Content-Disposition": `attachment; filename="data-${ctx.params.id}.csv"`
            // };

            // return "I'm image service";
            return  d;
        },
        stream(ctx) {
            return fs.createReadStream('./assets/images/index.jpeg');
        },
    }
}