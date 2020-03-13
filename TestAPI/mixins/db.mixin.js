"use strict";

const path = require("path");
const mkdir = require("mkdirp").sync;

const DbService = require("moleculer-db");

process.env.MONGO_URI = "mongodb://35.189.178.178:27017/wespace";

module.exports = function (collection) {
    if (process.env.MONGO_URI) {
        // Mongo adapter
        const MongoAdapter = require("moleculer-db-adapter-mongo");

        return {
            mixins: [DbService],
            adapter: new MongoAdapter(process.env.MONGO_URI),
            collection
        };
    }

    // --- NeDB fallback DB adapter

    // Create data folder
    mkdir(path.resolve("./data"));

    return {
        mixins: [DbService],
        adapter: new DbService.MemoryAdapter({ filename: `./data/${collection}.db` })
    };
};