"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTransport = void 0;
const TransportStream = require("winston-transport");
const types_1 = require("./types");
const constants_1 = require("./constants");
const mongodb_1 = require("mongodb");
const helpers_1 = require("./helpers");
class MongoTransport extends TransportStream {
    constructor(options) {
        if (!options.connectionString) {
            throw new Error('MongoDB transport requires "connectionString".');
        }
        super(options);
        this.level = options.level || constants_1.DEFAULT_LEVEL;
        this.silent = options.silent || false;
        this.metaDataToFlatten = options.metaDataToFlatten || [];
        this.initCollection(options).then(col => this.collection = col);
    }
    log(info, callback = (...args) => { }) {
        if (this.silent) {
            return callback(null, true);
        }
        const { level, message } = info, initialMeta = __rest(info, ["level", "message"]);
        const { meta, flattened } = (0, helpers_1.flattenSomeMetaData)(initialMeta, this.metaDataToFlatten);
        const doc = Object.assign(Object.assign({ level,
            message,
            meta }, flattened), { timestamp: new Date().toISOString() });
        this.collection.insertOne(doc)
            .then(() => {
            this.emit('logged');
            callback(null, true);
        })
            .catch((err) => {
            this.emit('error', err);
            callback(err);
        });
    }
    query(filter, options = {}) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const logs = yield this.collection.find(filter, options).toArray();
                const { limit, skip } = options;
                if (limit) {
                    const count = yield this.collection.countDocuments(filter);
                    const numPage = (skip || 0) / limit + 1;
                    const page = new types_1.PaginatedDataDto(logs, limit, numPage, count);
                    return resolve(page);
                }
                return resolve(logs);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    getCollection() {
        return this.collection;
    }
    /**
     * Initialize collection's connection.
     * @param options
     * @private
     */
    initCollection(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientOptions = options.clientOptions || {};
            const client = new mongodb_1.MongoClient(options.connectionString, clientOptions);
            yield client.connect();
            const db = client.db(options.dbName);
            const collectionName = options.collectionName || constants_1.DEFAULT_COL_NAME;
            const cappedSize = options.isCollectionCapped ? (options.cappedSize || constants_1.DEFAULT_CAPPED_SIZE) : null;
            try {
                return yield db.createCollection(collectionName, {
                    capped: options.isCollectionCapped,
                    size: cappedSize,
                });
            }
            catch (err) {
                // The error 48 means that the collection already exists
                if (err.code !== constants_1.ERR_COL_ALREADY_EXISTS)
                    throw err;
                return db.collection(collectionName);
            }
        });
    }
}
exports.MongoTransport = MongoTransport;
