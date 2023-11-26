export const flattenSomeMetaData = (initialMeta: any, fieldsToFlatten: string[]) => {
    return Object.entries(initialMeta).reduce((acc, [key, value]) => {
        const field = fieldsToFlatten.includes(key) ? 'flattened' : 'meta';

        return {
            ...acc,
            [field]: {
                ...acc[field],
                [key]: value,
            },
        }
    }, {
        meta: {},
        flattened: {},
    });
}
