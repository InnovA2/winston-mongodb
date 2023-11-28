"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedDataDto = void 0;
class PaginatedDataDto {
    constructor(items, limit, page, totalItems) {
        this.items = items;
        this.size = items.length;
        this.currentPage = +page;
        this.totalPages = Math.ceil(totalItems / limit);
        this.totalItems = +totalItems;
    }
}
exports.PaginatedDataDto = PaginatedDataDto;
