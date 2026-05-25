/**
 * Central API handler — wraps Axios with typed error extraction.
 */

import type { AxiosRequestConfig } from 'axios';
import AxiosInstance from './AxiosInstance';

export async function apiHandler<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const { data } = await AxiosInstance.request<T & { message?: string }>(config);
    return data;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const res = (err as { response?: { data?: { message?: string } } }).response;
      throw new Error(res?.data?.message ?? 'Request failed');
    }
    throw err;
  }
}
