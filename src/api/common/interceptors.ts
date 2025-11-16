import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { client } from './client';
import { toCamelCase, toSnakeCase } from './utils';

const CONTENT_TYPE = 'Content-Type';
const MULTIPART_FORM_DATA = 'multipart/form-data';

export default function interceptors() {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { headers, data } = config;

    if (headers && headers[CONTENT_TYPE] !== MULTIPART_FORM_DATA && data) {
      config.data = toSnakeCase(config.data);
    }

    // TODO: Add Supabase auth token here
    // Will be implemented after removing Zustand auth store

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const { data } = response;
      response.data = toCamelCase(data);

      // TODO: Add token refresh logic here
      // Will be implemented after removing Zustand auth store

      return response;
    },
    (error: AxiosError) => Promise.reject(error),
  );
}
