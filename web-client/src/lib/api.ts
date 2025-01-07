// web-client/src/lib/api.ts

import environment from '@/config/environment';
import logger from '@/config/logger';

interface CustomRequestInit extends RequestInit {
    _retry?: boolean;
}

/*
    Classe per gestire le richieste fetch
*/
class FetchClient {
    private static instance: FetchClient;
    private baseURL: string;
    private timeout: number;
    private headers: Record<string, string>;

    private constructor() {
        this.baseURL = environment.apiBaseUrl; // e.g., 'http://localhost:4000'
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

    private async handleRequest(url: string, options: CustomRequestInit = {}): Promise<Response> {
        const headers: Record<string, string> = {
            ...this.headers,
            ...(options.headers as Record<string, string>),
        }

        const config: CustomRequestInit = {
            ...options,
            headers,
        };

        // Log the config
        logger.info(`Making request to ${url} with config: ${JSON.stringify(config)}`);

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            return response;
        } catch (error) {
            logger.error(error);
            return Promise.reject(error);
        }
    }

    public async post(url: string, body: object, options?: RequestInit): Promise<Response> {
        const requestOptions: CustomRequestInit = {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(body),
            credentials: 'include', // Inclusione delle credenziali
            ...options,
        };
        return this.handleRequest(url, requestOptions);
    }

    public async put(url: string, body: object, options?: RequestInit): Promise<Response> {
        const requestOptions: CustomRequestInit = {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(body),
            credentials: 'include', // Inclusione delle credenziali
            ...options,
        };
        return this.handleRequest(url, requestOptions);
    }

    public async get(url: string, options?: RequestInit): Promise<Response> {
        const requestOptions: CustomRequestInit = {
            method: 'GET',
            headers: this.headers,
            credentials: 'include', // Inclusione delle credenziali
            ...options,
        };
        return this.handleRequest(url, requestOptions);
    }

    public async delete(url: string, options?: RequestInit): Promise<Response> {
        const requestOptions: CustomRequestInit = {
            method: 'DELETE',
            headers: this.headers,
            credentials: 'include', // Inclusione delle credenziali
            ...options,
        };
        return this.handleRequest(url, requestOptions);
    }
}

const fetchClient = FetchClient.getInstance();

export { fetchClient };
