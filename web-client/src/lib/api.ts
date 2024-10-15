import axios from 'axios';
import environment from '@/config/environment';
import { cookies } from 'next/headers';

const axiosInstance = axios.create({
	baseURL: environment.apiBaseUrl,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		const sessionCookie = cookies().get('accessToken');
		if (sessionCookie && sessionCookie.value) {
			config.headers['Authorization'] = `Bearer ${sessionCookie.value}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refreshToken = cookies().get('refreshToken');
			try {
				const { data } = await axiosInstance.post('/auth/refresh', {
					token: refreshToken?.value
				})
				cookies().set('accessToken', data.access_token, {
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
					httpOnly: true,
					secure: true,
					sameSite: 'lax',
				});
				axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}
		return Promise.reject(error);
	}
);

export { axiosInstance };
