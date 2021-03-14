export const handle = (fn: any, ...params: any[]) => typeof fn === 'function' && fn(...params);

export const paramsExists = (params: any[]) => params?.length && params.every(param => !!param);
