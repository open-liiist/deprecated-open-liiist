import environment from '@/config/environment';
import logger from '@/config/logger';

interface CustomRequestInit extends RequestInit {
	_retry?: boolean;
}

/*
	class to handle fetch requests
*/
class FetchClient {
	private static instance: FetchClient;
	private baseURL: string;
	private timeout: number;
	private headers: Record<string, string>;

	private constructor() {
		this.baseURL = environment.apiBaseUrl;
		this.timeout = 10000;
		this.headers = {
			'Content-Type': 'application/json',
		}
	}

	public static getInstance(): FetchClient {
		if (!FetchClient.instance) {
			FetchClient.instance = new FetchClient();
		}
		return FetchClient.instance;
	}

	private async handleRequest(url: string, options: CustomRequestInit = {}, accessToken?: string):
		Promise<Response> 
	{
		const headers: Record<string, string> = {
			...this.headers,
			...(options.headers as Record<string, string>),
		}

		if (accessToken) {
			headers['Authorization'] = `Bearer ${accessToken}`;
			this.headers = headers;
		}

		const config: CustomRequestInit = {
			...options,
			headers,
		};

		try {
			const response = await fetch(`${this.baseURL}${url}`, config);

			// handle 401 for token refresh
			// if (response.status === 401 && !config._retry) {
			// 	config._retry = true;
			// 	const refreshToken = cookies().get(environment.cookies.refresh);
			// 	if (refreshToken?.value) {
			// 		const refreshResponse = await this.post('/auth/refresh', {
			// 			token: refreshToken.value,
			// 		});
			//
			// 		if (refreshResponse.ok) {
			// 			const { accessToken } = await refreshResponse.json();
			// 			cookies().set(environment.cookies.access, accessToken, {
			// 				expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
			// 				httpOnly: true,
			// 				secure: true,
			// 				sameSite: 'lax',
			// 			});
			// 			headers['Authorization'] = `Bearer ${accessToken}`;
			// 			return fetch(`${this.baseURL}${url}`, { ...config, headers });
			// 		}
				// }
			// }

			return response;
		} catch (error) {
			logger.error(error);
			return Promise.reject(error);
		}
	}

	public async post(url: string, body: object, accessToken?: string): Promise<Response> {
		const options: RequestInit = {
			method: 'POST',
			headers: this.headers,
			body: JSON.stringify(body),
		};
		return this.handleRequest(url, options, accessToken);
	}

	public async put(url: string, body: object, accessToken?: string): Promise<Response> {
		const options: RequestInit = {
			method: 'PUT',
			headers: this.headers,
			body: JSON.stringify(body),
		};
		return this.handleRequest(url, options, accessToken);
	}

	public async get(url: string, accessToken?: string): Promise<Response> {
		const options: RequestInit = {
			method: 'GET',
			headers: this.headers,
		};
		return this.handleRequest(url, options, accessToken);
	}

	public async delete(url: string, accessToken?: string): Promise<Response> {
		const options: RequestInit = {
			method: 'DELETE',
			headers: this.headers,
		};
		return this.handleRequest(url, options, accessToken);
	}
}

const fetchClient = FetchClient.getInstance();

export { fetchClient };
