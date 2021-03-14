// Libs
import { QueryClient } from 'react-query';

// Types
import { QueryClientConfig } from './types';

let _client: QueryClient = new QueryClient();

export function setClient(client: QueryClient) {
	_client = client;
}

export function getClient() {
	return _client;
}

export function createClient(config: QueryClientConfig) {
	_client.setDefaultOptions(config.defaultOptions);
	return _client;
}
