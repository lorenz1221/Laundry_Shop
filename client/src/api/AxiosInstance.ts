/**
 * Axios Instance - Alternative HTTP client configuration
 * Note: Currently using native fetch via apiHandler.ts
 * This file is prepared for future axios integration if needed
 */

// To use axios, install it first: pnpm add axios
// import axios from 'axios';

const API_BASE_URL = '/api';

// Example axios instance configuration (commented out until axios is installed)
// export const axiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Add request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Add auth token or other headers here
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Add response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle errors globally
//     return Promise.reject(error);
//   }
// );

export { API_BASE_URL };
