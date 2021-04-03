export const handle = (fn: any, ...params: any[]) => typeof fn === 'function' && fn(...params);

export const paramsExists = (params: any[]) => params?.length && params.every(param => !!param);

export const combineOptions = (a: Record<any, any> = {}, b: Record<any, any> = {}) => {
	const functions = {};

	Object.entries(b).forEach(([key, value]) => {
		if (a[key] && typeof a[key] === 'function') {
			functions[key] = (...params: any[]) => {
				a[key](...params);

				if (typeof value === 'function') {
					value(...params);
				}
			};
		}
	});

	return { ...a, ...b, ...functions };
};
