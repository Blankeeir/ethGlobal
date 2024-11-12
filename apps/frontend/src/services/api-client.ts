// // apps/frontend/src/networking/api-client.ts
// import axios, { AxiosInstance, AxiosResponse } from 'axios';
// import { useDynamicContext, UserProfile } from '@dynamic-labs/sdk-react-core';
// // types/api.ts


// export interface ApiResponse<T> {
//   data: T;
//   status: number;
//   message?: string;
// }


// interface ApiClientConfig {
//   baseURL: string;
//   timeout?: number;
// }

// class ApiClient {
//   private static instance: ApiClient;
//   private axios: AxiosInstance;

//   private constructor(config: ApiClientConfig) {
//     this.axios = axios.create({
//       baseURL: config.baseURL,
//       timeout: config.timeout || 10000,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });

//     this.setupInterceptors();
//   }

//   static getInstance(config: ApiClientConfig): ApiClient {
//     if (!ApiClient.instance) {
//       ApiClient.instance = new ApiClient(config);
//     }
//     return ApiClient.instance;
//   }

//   private setupInterceptors() {
//     this.axios.interceptors.request.use(
//       async (config) => {
//         const token = localStorage.getItem('auth_token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );

//     this.axios.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           // Handle unauthorized access
//           localStorage.removeItem('auth_token');
//           window.location.href = '/login';
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   // Generic request method
//   async request<T>(
//     method: string,
//     url: string,
//     data?: Record<string, unknown>,
//     config = {}
//   ): Promise<T> {
//     try {
//       const response: AxiosResponse<T> = await this.axios.request({
//         method,
//         url,
//         data,
//         ...config
//       });
//       return response.data;
//     } catch (error: unknown) {
//       if (axios.isAxiosError(error) && error.response) {
//         throw new Error(error.response.data.message || 'Request failed');
//       }
//       throw error;
//     }
//   }

//   // Convenience methods
//   async get<T>(url: string, config = {}): Promise<T> {
//     return this.request<T>('GET', url, undefined, config);
//   }

//   async post<T>(url: string, data?: Record<string, unknown>, config = {}): Promise<T> {
//     return this.request<T>('POST', url, data, config);
//   }

//   async put<T>(url: string, data?: Record<string, unknown>, config = {}): Promise<T> {
//     return this.request<T>('PUT', url, data, config);
//   }

//   async delete<T>(url: string, config = {}): Promise<T> {
//     return this.request<T>('DELETE', url, undefined, config);
//   }
// }

// // API hooks
// export const useApi = () => {
//   const { user } = useDynamicContext() as { user: UserProfile & { walletAddress?: string } };

//   if (!user || !user.walletAddress) {
//     throw new Error('User or wallet address is not available');
//   }
  
//   const apiClient = ApiClient.getInstance({
//     baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
//   });
  

//   return {
//     products: {
//       list: () => apiClient.get('/products'),
//       create: (data?: Record<string, unknown>) => apiClient.post('/products', data),
//       get: (id: string) => apiClient.get(`/products/${id}`),
//       update: (id: string, data?: Record<string, unknown>) => apiClient.put(`/products/${id}`, data)
//     },
//     transactions: {
//       list: () => apiClient.get('/transactions'),
//       get: (id: string) => apiClient.get(`/transactions/${id}`)
//     },
//     user: {
//       getProfile: () => apiClient.get(`/users/${user?.walletAddress}`),
//       updateProfile: (data?: Record<string, unknown>) => 
//         apiClient.put(`/users/${user?.walletAddress}`, data),
//       getActivities: async () => {

//         // implementation
        

//       }
//     }
//   };

// };