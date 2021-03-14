// Libs
import { MutateOptions, MutationObserver, UseMutationOptions, UseQueryOptions } from 'react-query';

// Types
import {
	Dictionary,
	MutationConfig,
	MutationFunction,
	ServiceMutation,
	QueryFunction,
	ServiceQuery,
	ServiceI,
	CreateServiceReturn
} from './types';

import { getClient } from './client';
import { useQuery } from './hooks';
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

function serviceQueries(queries: Dictionary<QueryFunction<any> | UseQueryOptions>) {
	const queriesResult: Dictionary<ServiceQuery> = {};
	const service: Dictionary = {};

	if (typeof queries !== 'object') {
		return { service: {}, queries: {} };
	}

	for (const entries of Object.entries(queries!)) {
		const [queryKey, queryOptions]: [string, UseQueryOptions | QueryFunction] = entries;
		const queryFn = typeof queryOptions === 'function' ? queryOptions : (queryOptions.queryFn as QueryFunction);
		const haveOptions = typeof queryOptions !== 'function';
		const options: UseQueryOptions = haveOptions ? (queryOptions as UseQueryOptions) : {};

		service[queryKey] = fetchQuery({
			queryKey,
			queryFn,
			options
		});

		queriesResult[queryKey] = (...params: any[]) => {
			const processedQueryKey = paramsExists(params) ? [queryKey, ...params] : queryKey;
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

function serviceMutation(mutations: Dictionary<MutationFunction<any> | MutationConfig>) {
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
			mutationKey,
			mutationFn,
			options
		});

		mutationsResult[mutationKey] = (...params: any[]) => {
			const processedQueryKey = params?.length ? [mutationKey, ...params] : mutationKey;

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

export function createService<T extends ServiceI>({ queries, mutations }: T): CreateServiceReturn<T> {
	const q = serviceQueries(queries);
	const m = serviceMutation(mutations);

	const service: Dictionary = {
		...q.service,
		...m.service,
		queries: q.queries,
		mutations: m.mutations
	};

	return service as CreateServiceReturn<T>;
}

const service = createService({
	queries: {
		get: {
			queryFn: () => Promise.resolve('test')
			// onSuccess() {
			// 	service.queries.get().setData((data))
			// }
		},
		getById: () => Promise.resolve('test')
	},
	mutations: {
		getById: (test: string) => Promise.resolve('test')
	}
});

const { data } = useQuery(service.queries.getById());
