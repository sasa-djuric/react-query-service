import { useMemo } from 'react';
import { useQuery as useReactQuery, UseQueryOptions } from 'react-query';
import { ServiceQuery, ServiceQueryReturn, UnwrapPromise } from '../types';

type QueryFnReturn<T extends ServiceQueryReturn> = UnwrapPromise<ReturnType<T['queryFn']>>;

type QueryOptions<T extends ServiceQuery | ServiceQueryReturn> = T extends ServiceQuery
	? // @ts-ignore
	  ReturnType<ReturnType<T>>
	: T extends ServiceQueryReturn
	? T
	: unknown;

export const useQuery = <Q extends ServiceQuery | ServiceQueryReturn>(query: Q, options?: UseQueryOptions) => {
	// @ts-ignore
	const queryData = useMemo<QueryOptions<Q>>(() => (typeof query === 'function' ? query() : query), [query, options]);

	return useReactQuery<QueryFnReturn<QueryOptions<Q>>>({
		...queryData.options,
		...options,
		queryFn: ({ queryKey }) => queryData.queryFn(queryKey.slice(1)),
		queryKey: queryData.queryKey
	});
};
