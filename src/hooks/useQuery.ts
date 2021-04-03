import { useMemo } from 'react';
import { useQuery as useReactQuery, UseQueryOptions } from 'react-query';
import { ServiceQuery, ServiceQueryReturn, UnwrapPromise } from '../types';
import { combineOptions } from '../utils';

type QueryFnReturn<T extends ServiceQueryReturn> = UnwrapPromise<ReturnType<T['queryFn']>>;

type QueryOptions<T extends ServiceQuery | ServiceQueryReturn> = T extends ServiceQuery
	? // @ts-ignore
	  ReturnType<ReturnType<T>>
	: T extends ServiceQueryReturn
	? T
	: unknown;

export const useQuery = <Q extends ServiceQuery | ServiceQueryReturn>(query: Q, options?: UseQueryOptions) => {
	const queryData = useMemo<QueryOptions<Q>>(
		// @ts-ignore
		() => (typeof query === 'function' ? query() : query),
		[query, options]
	);

	return useReactQuery<QueryFnReturn<QueryOptions<Q>>>({
		...combineOptions(queryData.options, options),
		queryFn: ({ queryKey }) => queryData.queryFn(queryKey.slice(1)),
		queryKey: queryData.queryKey
	});
};
