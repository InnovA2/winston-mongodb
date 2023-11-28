# Winston MongoDB transport

A easy to use Winston 3.x transport for MongoDB.

- [Installation](#hammer_and_wrench-installation)
- [Usage](#memo-usage)
- [Licence](#balance_scale-licence)
- [Authors](#busts_in_silhouette-authors)
- [Contributors](#handshake-contributors)

## :hammer_and_wrench: Installation
To import the library you just need to run this command :
```shell
npm install @innova2/winston-mongodb
```

Make sure you have Winston, otherwise run this command :
```shell
npm install winston
```

## :memo: Usage
### Configuration
Instantiate the MongoTransport and pass options:
```ts
const mongoTransport = new MongoTransport({
    connectionString: 'your mongo connection string',
    dbName: 'your database name',
    collectionName: 'your collection name',
    isCollectionCapped: true,
    cappedSize: 100000000, // 100 Mo
    clientOptions: {
        maxPoolSize: 10,
    },
});
```
The collection will be automatically created if it does not exist.

Look at the available options:
```ts
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
     * Optional. Size limit in bytes of the capped collection.
     */
    cappedSize?: number;

    /**
     * Optional. Flat map meta properties (spread out at the root of the Mongo document).
     */
    metaDataToFlatten?: string[];
}
```

#### Specific document structure
You can override the type corresponding to the document structure
by passing the type to generic of constructor.

Look at the base log interface:
```ts
export interface BaseLogDocument extends OptionalId<Document> {
    level: string;
    message: string;
    meta?: object;
    timestamp: string;
}
```

For example, you want to add 'context' and 'module' fields.
Just create a custom log interface by extending BaseLogDocument like:
```ts
export interface CustomLog extends BaseLogDocument {
    context: string;
    module: string;
}
```
And configure your instance like:
```ts
const mongoTransport = new MongoTransport<CustomLog>({
    connectionString: 'your mongo connection string',
    dbName: 'your database name',
    collectionName: 'your collection name',
    isCollectionCapped: true,
    cappedSize: 100000000, // 100 Mo
    clientOptions: {
        maxPoolSize: 10,
    },
    // don't forget the metaDataToFlatten, so that
    // this metadata is at the top level of the document
    metaDataToFlatten: ['module', 'context'],
});
```

> Please note that changing the type it has no impact on database structure.
> It's only useful when retrieving logs or directly the collection (`MongoTransport#getCollection`).
> The document structure in the database depending on winston logs structure.

Example of logging with Nest:
```ts
// Logging interceptor
this.logger.log(
    {
        message: 'HTTP call',
        // Metadata (meta object in DB)
        method: req.method,
        path: req.url,
        statusCode: res.statusCode,
        responseTimeInMs: endDate - startDate
    },
    [ctrlName, methodName].join(LOG_CTX_SEPARATOR), // Context (flattened by 'metaDataToFlatten' option)
);

// Simple formatting logs
const formattingLog = winston.format(entry => ({
    ...entry,
    module: 'API', // Flattened by 'metaDataToFlatten' option
}));

export default async (mongoTransport: MongoTransport): Promise<WinstonModuleOptions> => ({
    format: winston.format.combine(formattingLog(), winston.format.json()),
    transports: [mongoTransport],
});
```

### Retrieve logs
You can use the query() method like:
```ts
transport.query({
    timestamp: {
        $gte: new Date(...),
        $lte: new Date(...),
    }
});
```
The result type is: `Promise<T[]>`. T is BaseLogDocument or your custom type.

If you want paginated date, just push 'limit' option:
```ts
transport.query({
    timestamp: {
        $gte: new Date(...),
        $lte: new Date(...),
    }
}, { limit: 20 }); // First page
```
The result type is: `Promise<PaginatedDataDto<T>>`. T is BaseLogDocument or your custom type.

To reach another page:
```ts
transport.query({
    timestamp: {
        $gte: new Date(...),
        $lte: new Date(...),
    }
}, { limit: 20, skip: 20 }); // Second page
```

You can also directly use the collection Mongo object by calling `transport.getCollection()`. 

## :balance_scale: Licence
[MIT](LICENSE)

## :busts_in_silhouette: Authors
- [Adrien MARTINEAU](https://github.com/WaZeR-Adrien)
- [Angéline TOUSSAINT](https://github.com/AngelineToussaint)

## :handshake: Contributors
Do not hesitate to participate in the project!
Contributors list will be displayed below.
