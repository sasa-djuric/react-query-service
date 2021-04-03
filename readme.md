# React Query Service

Wrapper around react query which provides the functionality of declaring queries outside of react.

## Usage

```jsx
/* App.jsx */
import { QueryClientProvider, useQuery, createClient } from 'react-query-service';
import githubService from './github-service.js';

const queryClient = createClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Example />
		</QueryClientProvider>
	);
}

function Example() {
	const { isLoading, error, data } = useQuery(githubService.queries.getProfileById(1));

	if (isLoading) return 'Loading...';

	if (error) return 'An error has occurred: ' + error.message;

	return (
		<div>
			<h1>{data.name}</h1>
			<p>{data.description}</p>
			<strong>👀 {data.subscribers_count}</strong>
			<strong>🍴 {data.forks_count}</strong>
		</div>
	);
}

/* githubService.js */
import { createService } from 'react-query-service';

function getProfileById(id) {
	return fetch(`/profile/${id}`).then(res => res.json());
}

function getProfiles() {
	return fetch(`/profile/all`).then(res => res.json());
}

function createProfile(data) {
	return fetch('/profile', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then(result => result.json());
}

const githubService = createService({
	name: 'github'
	queries: {
		getProfileById,
		getProfiles
	},
	mutations: {
		createProfile: {
			mutationFn: createProfile,
			onSuccess: data => {
				githubService.queries.getProfileById(data.id).setData(data);
			}
		}
	}
});

export default githubService;
```

## License

[MIT](https://github.com/sasa-djuric/react-query-service/blob/master/LICENSE)
