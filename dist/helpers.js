"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flattenSomeMetaData = void 0;
const flattenSomeMetaData = (initialMeta, fieldsToFlatten) => {
    return Object.entries(initialMeta).reduce((acc, [key, value]) => {
        const field = fieldsToFlatten.includes(key) ? 'flattened' : 'meta';
        return Object.assign(Object.assign({}, acc), { [field]: Object.assign(Object.assign({}, acc[field]), { [key]: value }) });
    }, {
        meta: {},
        flattened: {},
    });
};
exports.flattenSomeMetaData = flattenSomeMetaData;
