"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = exports.setCache = void 0;
const cache = new Map();
const setCache = (key, value) => {
    cache.set(key, value);
};
exports.setCache = setCache;
const getCache = (key) => {
    return cache.get(key);
};
exports.getCache = getCache;
