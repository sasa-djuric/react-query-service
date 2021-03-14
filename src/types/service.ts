// Types
import { UseQueryOptions } from 'react-query';
import Dictionary from './dictionary';
import { MutationConfig, MutationFunction, ServiceMutation } from './mutation';
import { QueryFunction, ServiceQuery } from './query';
import UnwrapPromise from './unwrap-promise';

export interface ServiceI {
	queries?: Dictionary<UseQueryOptions | QueryFunction>;
	mutations?: Dictionary<MutationConfig | MutationFunction>;
}

export type Queries<T extends ServiceI> = {
	[P in keyof T['queries']]: T['queries'] extends Dictionary
		? T['queries'][P] extends Function
			? T['queries'][P]
			: T['queries'][P] extends Dictionary
			? T['queries'][P]['queryFn']
			: never
		: never;
};

export type Mutations<T extends ServiceI> = {
	[P in keyof T['mutations']]: T['mutations'] extends Dictionary
		? T['mutations'][P] extends Function
			? T['mutations'][P]
			: T['mutations'][P] extends Dictionary
			? T['mutations'][P]['mutationFn']
			: never
		: never;
};

export type ServiceQueries<T extends ServiceI> = {
	queries: {
		[P in keyof T['queries']]: T['queries'] extends Dictionary
			? T['queries'][P] extends Function
				? ServiceQuery<UnwrapPromise<T['queries'][P]>>
				: T['queries'][P] extends Dictionary
				? ServiceQuery<UnwrapPromise<T['queries'][P]['queryFn']>>
				: never
			: never;
	};
};

export type ServiceMutations<T extends ServiceI> = {
	mutations: {
		[P in keyof T['mutations']]: T['mutations'] extends Dictionary
			? T['mutations'][P] extends Function
				? ServiceMutation<UnwrapPromise<T['mutations'][P]>>
				: T['mutations'][P] extends Dictionary
				? ServiceMutation<UnwrapPromise<T['mutations'][P]['mutationFn']>>
				: never
			: never;
	};
};

export type CreateServiceReturn<T extends ServiceI> = ServiceQueries<T> &
	Queries<T> &
	ServiceMutations<T> &
	Mutations<T>;
