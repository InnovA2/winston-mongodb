import * as TransportStream from 'winston-transport';
import { BaseLogDocument, MongoTransportOptions, PaginatedDataDto, PaginatedQueryOptions } from './types';
import { Collection, Document, Filter, FindOptions, WithId } from 'mongodb';
export declare class MongoTransport<T extends BaseLogDocument> extends TransportStream {
    private readonly metaDataToFlatten;
    private collection;
    constructor(options: MongoTransportOptions);
    log(info: T, callback?: (...args: any[]) => void): void;
    query(filter: Filter<Document>, options?: Omit<FindOptions, 'limit'>): Promise<WithId<T>[]>;
    query(filter: Filter<Document>, options: PaginatedQueryOptions): Promise<PaginatedDataDto<WithId<T>>>;
    getCollection(): Collection<T>;
    /**
     * Initialize collection's connection.
     * @param options
     * @private
     */
    private initCollection;
}
