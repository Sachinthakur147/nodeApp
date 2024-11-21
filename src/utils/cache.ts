const cache = new Map();

export const setCache = (key: string, value:any) =>{
     cache.set(key, value);
};

export const getCache = (key: string) =>{
     return cache.get(key);
};