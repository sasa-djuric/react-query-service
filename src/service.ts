// Libs
import { MutateOptions, MutationObserver, UseMutationOptions } from 'react-query';

// Types
import {
	Dictionary,
	MutationConfig,
	MutationFunction,
	ServiceMutation,
	QueryFunction,
	ServiceQuery,
	ServiceI,
	CreateServiceReturn,
	QueryConfig
} from './types';

import { getClient } from './client';
import { paramsExists } from './utils';

interface Fetch {
	options: any;
	queryKey: string;
	queryFn: QueryFunction;
}

export function fetchQuery({ queryKey, queryFn, options }: Fetch) {
	return (...params: any[]) => {
		const processedQueryKey = paramsExists(params) ? [queryKey, ...params] : queryKey;
		const queryClient = getClient();
		const defaultedOptions = queryClient.defaultQueryObserverOptions(options);
		const queryCache = queryClient.getQueryCache();
		const cachedQuery = queryCache.find(processedQueryKey);
		const queryData = queryClient.getQueryData(processedQueryKey);

		if (cachedQuery?.state.data) {
			return Promise.resolve(queryData);
		}

		const query = queryCache.build(queryClient, {
			queryKey: processedQueryKey,
			...defaultedOptions,
			...options,
			queryFn: () => queryFn(...params)
		});

		return query.fetch();
	};
}

interface Mutate {
	mutationKey: string;
	mutationFn: MutationFunction;
	options: MutateOptions<unknown, unknown, unknown>;
}

function mutate({ mutationKey, mutationFn, options }: Mutate) {
	return (...args: any[]) => {
		const mutation = new MutationObserver(getClient(), {
			mutationKey,
			...options,
			mutationFn: (args: any[]) => mutationFn(...args)
		});

		return mutation.mutate(args);
	};
}

function serviceQueries(name: string, queries: Dictionary<QueryFunction<any> | QueryConfig>) {
	const queriesResult: Dictionary<ServiceQuery> = {};
	const service: Dictionary = {};

	if (typeof queries !== 'object') {
		return { service: {}, queries: {} };
	}

	for (const entries of Object.entries(queries!)) {
		const [queryKey, queryOptions]: [string, QueryConfig | QueryFunction] = entries;
		const queryFn = typeof queryOptions === 'function' ? queryOptions : (queryOptions.queryFn as QueryFunction);
		const haveOptions = typeof queryOptions !== 'function';
		const options: QueryConfig = haveOptions ? (queryOptions as QueryConfig) : {};

		service[queryKey] = fetchQuery({
			queryKey: `${name}:${queryKey}`,
			queryFn,
			options
		});

		queriesResult[queryKey] = (...params: any[]) => {
			const processedQueryKey = paramsExists(params) ? [`${name}:${queryKey}`, ...params] : `${name}:${queryKey}`;
			const queryClient = getClient();
			const query = queryClient.getQueryCache().find(processedQueryKey);

			const setData = updater =>
				queryClient.setQueryData(
					processedQueryKey,
					typeof updater === 'function' ? updater(query?.state?.data) : updater
				);

			const invalidate = () => queryClient.invalidateQueries(processedQueryKey);

			return {
				queryKey: processedQueryKey,
				queryFn: (args: any[]) => queryFn(...args),
				setData,
				invalidate,
				options
			};
		};
	}

	return {
		service,
		queries: queriesResult
	};
}

function serviceMutation(name: string, mutations: Dictionary<MutationFunction<any> | MutationConfig>) {
	const mutationsResult: Dictionary<ServiceMutation> = {};
	const service: Dictionary = {};

	if (typeof mutations !== 'object') {
		return { service: {}, mutations: {} };
	}

	for (const entries of Object.entries(mutations!)) {
		const [mutationKey, mutationOptions]: [string, MutationConfig | MutationFunction] = entries;
		const mutationFn =
			typeof mutationOptions === 'function' ? mutationOptions : (mutationOptions.mutationFn as MutationFunction);
		const haveOptions = typeof mutationOptions !== 'function';
		const options: any = haveOptions ? (mutationOptions as UseMutationOptions) : {};

		service[mutationKey] = mutate({
			mutationKey: `${name}:${mutationKey}`,
			mutationFn,
			options
		});

		mutationsResult[mutationKey] = (...params: any[]) => {
			const processedQueryKey = params?.length ? [`${name}:${mutationKey}`, ...params] : `${name}:${mutationKey}`;

			return {
				mutationKey: processedQueryKey,
				mutationFn,
				options
			};
		};
	}

	return {
		service,
		mutations: mutationsResult
	};
}

export function createService<T extends ServiceI>({ name, queries, mutations }: T): CreateServiceReturn<T> {
	const q = serviceQueries(name, queries);
	const m = serviceMutation(name, mutations);

	const service: Dictionary = {
		...q.service,
		...m.service,
		queries: q.queries,
		mutations: m.mutations
	};

	return service as CreateServiceReturn<T>;
}
