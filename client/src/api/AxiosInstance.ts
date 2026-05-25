/**
 * Axios instance — credentials + JSON for Spinzone PHP REST API.
 */

import axios from 'axios';

const AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default AxiosInstance;
