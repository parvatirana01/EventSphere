import axios, { AxiosError, AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { getApiUrl, isDevelopment } from '../../config/environment';
import { ApiResponse } from './types';


export const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: getApiUrl(),
        timeout: 20 * 1000,
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    });

    
    client.interceptors.request.use(
        (config) => {
            if (isDevelopment()) {
                
                
                (config as any).metadata = { startTime: new Date() };
            }
            return config;
        },
        (error: AxiosError) => {
            if (isDevelopment()) {
                console.log('Request Error: ', error);
            }
            return Promise.reject(error);
        }
    );


    client.interceptors.response.use(
        (response) => {
            if (isDevelopment()) {
                const duration = new Date().getTime() - (response.config as any).metadata?.startTime?.getTime();
                console.log(`API Response: ${response.status} ${response.config.url} (${duration}ms)`);
            }
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                if (error.config.url?.includes('/auth/login') ||
                    error.config.url?.includes('/auth/refresh-token') ||
                    error.config.url?.includes('/auth/logout')) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                try {
                    

                    const refreshResponse = await client.post("/auth/refresh-token");

                    if (refreshResponse.data.success) {
                        
                        return client(originalRequest);
                    }

                    throw new Error("Refresh Token invalid");
                } catch (error) {
                   


                    const { useAuthStore } = await import('../../store/authStore');
                    useAuthStore.getState().clearAuth();

                    return Promise.reject(error);
                }
            }

           

            return Promise.reject(error);
        }
    );

    return client;
};

export const apiClient = createApiClient();
export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config);
}
export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config)
}
export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config)
}
export const put = <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
};


export default apiClient;
