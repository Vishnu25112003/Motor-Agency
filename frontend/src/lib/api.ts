// src/lib/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://motor-agency.onrender.com';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        try {
          const defaultAuth = (this.client.defaults.headers as any).common?.Authorization;
          if (defaultAuth) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = defaultAuth;
          } else {
            const stored = localStorage.getItem('motortest_auth');
            if (stored) {
              const { token } = JSON.parse(stored);
              if (token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
              }
            }
          }
        } catch (e) {
          // Request interceptor error
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('motortest_auth');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(token: string | null) {
    try {
      if (token) {
        (this.client.defaults.headers as any).common['Authorization'] = `Bearer ${token}`;
      } else {
        delete (this.client.defaults.headers as any).common['Authorization'];
      }
    } catch (e) {
      // setAuthToken failed
    }
  }

  public getAxiosInstance() {
    return this.client;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }

  async upload<T>(url: string, file: File, additionalData?: any): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    if (additionalData) {
      Object.keys(additionalData).forEach((key) => formData.append(key, additionalData[key]));
    }
    const response = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
