import * as TransportStream from 'winston-transport';
import { BaseLogDocument, MongoTransportOptions, PaginatedDataDto, PaginatedQueryOptions } from './types';
import { Collection, Filter, FindOptions, WithId } from 'mongodb';
export declare class MongoTransport<T extends BaseLogDocument> extends TransportStream {
    private readonly metaDataToFlatten;
    private collection;
    constructor(options: MongoTransportOptions);
    log(info: T, callback?: (...args: any[]) => void): void;
    query(filter: Filter<T>, options?: Omit<FindOptions, 'limit'>): Promise<WithId<T>[]>;
    query(filter: Filter<T>, options: PaginatedQueryOptions): Promise<PaginatedDataDto<WithId<T>>>;
    getCollection(): Collection<T>;
    /**
     * Initialize collection's connection.
     * @param options
     * @private
     */
    private initCollection;
}
