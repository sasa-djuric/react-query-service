import { useCallback, useState } from 'react';
import { UseQueryOptions } from 'react-query';
import { useQuery } from './useQuery';
import { ServiceQuery, ServiceQueryReturn } from '../types';

export const useLazyQuery = <T extends ServiceQuery | ServiceQueryReturn>(
	queryFactory: T,
	options?: UseQueryOptions
) => {
	const [enabled, setEnabled] = useState(false);
	const result = useQuery(queryFactory, { ...options, enabled });

	const fetch = useCallback(() => {
		setEnabled(true);
	}, []);

	return {
		...result,
		fetch
	};
};
