import { MutateOptions, UseMutationOptions } from 'react-query';

export interface MutationConfig extends MutateOptions {
	mutationFn: MutationFunction;
}

export type MutationFunction<T = any> = (...args: any[]) => Promise<T>;

export interface ServiceMutationReturn<T = any> {
	mutationKey: string | any[];
	mutationFn: MutationFunction<T>;
	options: UseMutationOptions;
}

export type ServiceMutation<T = any> = () => ServiceMutationReturn<T>;
