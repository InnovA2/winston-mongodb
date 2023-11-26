import { TransportStreamOptions } from 'winston-transport';
import { MongoClientOptions } from 'mongodb';

export class PaginatedDataDto<T> {
    items: T[];
    size: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;

    constructor(items: T[], limit: number, page: number, totalItems: number) {
        this.items = items;
        this.size = items.length;
        this.currentPage = +page;
        this.totalPages = Math.ceil(totalItems / limit);
        this.totalItems = +totalItems;
    }
}

export interface MongoTransportOptions extends TransportStreamOptions {
    /**
     * Connection URI.
     */
    connectionString: string;

    /**
     * Optional. Options on creation of Mongo connection.
     */
    clientOptions?: MongoClientOptions;

    /**
     * Name of the database.
     */
    dbName: string;

    /**
     * Name of the collection.
     * The collection is auto-generated if it does not exist.
     */
    collectionName: string;

    /**
     * Is collection capped (size limitation).
     */
    isCollectionCapped: boolean;

    /**
     * Optional. Size limit of the capped collection.
     */
    cappedSize?: number;

    /**
     * Optional. Flat map meta properties (spread out at the root of the Mongo document.
     */
    metaDataToFlatten?: string[];
}
