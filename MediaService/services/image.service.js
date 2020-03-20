var fs = require('fs');
var path = require('path');

module.exports = {
    // Define service name
    name: "image",

    actions: {
        stream(ctx) {
            const pathAssets = './assets/' + ctx.params.path;

            try {
                if (fs.existsSync(pathAssets)) {
                    return fs.createReadStream(pathAssets);
                }
                throw "FILE NOT FOUND";
            }
            catch (err) {
                return this.Promise.reject(err);
            }
        },
        uploadSpaceCover(ctx) {
            const pathAssets = './assets/images/space/cover';

            if (!fs.existsSync(pathAssets)) {
                fs.mkdirSync(pathAssets);
            }

            return new this.Promise((resolve, reject) => {
                const filePath = path.join(pathAssets, this.uniqueName(ctx.meta.$multipart));
                const f = fs.createWriteStream(filePath);
                f.on("close", () => {
                    // File written successfully
                    this.logger.info(`Uploaded file stored in '${filePath}'`);
                    resolve({ filePath, code: 200 });
                });

                ctx.params.on("error", err => {
                    this.logger.info("File error received", err.message);
                    resolve({ err, code: 500 });

                    // Destroy the local file
                    f.destroy(err);
                });

                f.on("error", (err) => {
                    this.logger.info("File error received", err.message);
                    // Remove the errored file.
                    fs.unlinkSync(filePath);
                    resolve({ err, code: 500 });
                });

                ctx.params.pipe(f);
            });
        }
    },
    methods: {
        uniqueName(multipart) {
            let { fname } = multipart;
            let ext = fname.split('.')[fname.split('.').length - 1];
            fname = fname.replace(new RegExp(ext, 'g'), '');

            return fname + "_" + Date.now() + "." + ext;
        }
    }
}