import { useMemo } from 'react';
import { useMutation as useReactQueryMutation, UseMutationOptions } from 'react-query';
import { ServiceMutation, ServiceMutationReturn, UnwrapPromise } from '../types';
import { combineOptions } from '../utils';

type MutationFnReturn<T extends ServiceMutationReturn> = UnwrapPromise<ReturnType<T['mutationFn']>>;

type MutationOptions<T extends ServiceMutation | ServiceMutationReturn> = T extends ServiceMutation
	? ReturnType<T>
	: T extends ServiceMutationReturn
	? T
	: unknown;

export const useMutation = <T extends ServiceMutation | ServiceMutationReturn>(
	mutation: T,
	options?: UseMutationOptions
) => {
	const mutationOptions = useMemo<MutationOptions<T>>(
		// @ts-ignore
		() => (typeof mutation === 'function' ? mutation() : mutation),
		[mutation]
	);

	const result = useReactQueryMutation<MutationFnReturn<MutationOptions<T>>>(
		mutationOptions.mutationKey,
		mutationOptions.mutationFn,
		combineOptions(mutationOptions, options)
	);

	return {
		...result,
		// @ts-ignore
		mutateAsync: (...args: any[]) => result.mutateAsync(args)
	};
};
