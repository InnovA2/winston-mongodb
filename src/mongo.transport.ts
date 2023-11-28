import * as TransportStream from 'winston-transport';
import { BaseLogDocument, MongoTransportOptions, PaginatedDataDto, PaginatedQueryOptions } from './types';
import { DEFAULT_CAPPED_SIZE, DEFAULT_COL_NAME, DEFAULT_LEVEL, ERR_COL_ALREADY_EXISTS } from './constants';
import {
    Collection, Document,
    Filter,
    FindOptions,
    MongoClient,
    MongoClientOptions,
    OptionalUnlessRequiredId, WithId
} from 'mongodb';
import { flattenSomeMetaData } from './helpers';

export class MongoTransport<T extends BaseLogDocument> extends TransportStream {
    private readonly metaDataToFlatten: string[];
    private collection: Collection<T>;

    constructor(options: MongoTransportOptions) {
        if (!options.connectionString) {
            throw new Error('MongoDB transport requires "connectionString".');
        }

        super(options);

        this.level = options.level || DEFAULT_LEVEL;
        this.silent = options.silent || false;
        this.metaDataToFlatten = options.metaDataToFlatten || [];

        this.initCollection(options).then(col => this.collection = col);
    }

    log(info: T, callback = (...args: any[]) => {}) {
        if (this.silent) {
            return callback(null, true);
        }

        const { level, message, ...initialMeta } = info;

        const { meta, flattened } = flattenSomeMetaData(initialMeta, this.metaDataToFlatten);

        const doc = {
            level,
            message,
            meta,
            ...flattened,
            timestamp: new Date().toISOString(),
        } as OptionalUnlessRequiredId<T>;

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

    query(filter: Filter<Document>, options?: Omit<FindOptions, 'limit'>): Promise<WithId<T>[]>;

    query(filter: Filter<Document>, options: PaginatedQueryOptions): Promise<PaginatedDataDto<WithId<T>>>;

    query(filter: Filter<Document>, options: FindOptions = {}): Promise<PaginatedDataDto<WithId<T>> | WithId<T>[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const logs = await this.collection.find(filter, options).toArray();
                const { limit, skip } = options;

                if (limit) {
                    const count = await this.collection.countDocuments(filter);
                    const numPage = (skip || 0) / limit + 1;

                    const page = new PaginatedDataDto<WithId<T>>(logs, limit, numPage, count);

                    return resolve(page);
                }
                return resolve(logs);
            } catch (e) {
                reject(e);
            }
        })
    }

    getCollection() {
        return this.collection;
    }

    /**
     * Initialize collection's connection.
     * @param options
     * @private
     */
    private async initCollection(options: MongoTransportOptions) {
        const clientOptions = options.clientOptions || {} as MongoClientOptions;
        const client = new MongoClient(options.connectionString, clientOptions);
        await client.connect();

        const db = client.db(options.dbName);
        const collectionName = options.collectionName || DEFAULT_COL_NAME;

        const cappedSize = options.isCollectionCapped ? (options.cappedSize || DEFAULT_CAPPED_SIZE) : null;

        try {
            return await db.createCollection<T>(collectionName, {
                capped: options.isCollectionCapped,
                size: cappedSize,
            });
        } catch (err) {
            // The error 48 means that the collection already exists
            if (err.code !== ERR_COL_ALREADY_EXISTS) throw err;
            return db.collection<T>(collectionName);
        }
    }
}
