import { UseQueryOptions } from 'react-query';

export interface QueryConfig extends Omit<UseQueryOptions, 'queryKey'> {}

export type QueryFunction<T = any> = (...args: any[]) => Promise<T>;

export interface ServiceQueryReturn<T = any> {
	queryKey: string | any[];
	queryFn: QueryFunction<T>;
	setData: (updater: (data: T) => T) => void;
	invalidate: () => void;
	options: UseQueryOptions;
}

export type ServiceQuery<T = any> = (...params: any[]) => ServiceQueryReturn<T>;
