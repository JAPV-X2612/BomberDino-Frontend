import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

/**
 * Centralized API service with JWT token management.
 * Automatically attaches Authorization header to requests.
 */
class ApiService {
  private readonly client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          if (this.accessToken) {
            config.headers.Authorization = `Bearer ${this.accessToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            console.warn('Unauthorized - token may be expired');
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
          console.error('API Error:', error.response?.data || error.message);
          return Promise.reject(error);
        }
    );
  }

  /**
   * Gets the axios client instance.
   * @returns AxiosInstance
   */
  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiService = new ApiService();
export const apiClient = apiService.getClient();
