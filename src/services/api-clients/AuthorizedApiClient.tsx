import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import Config from 'react-native-config';
import { keychainData } from '@/utils/secureStorage';

export const createAuthorizedApiClient = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
  });

  const onRequest = async (request: AxiosRequestConfig) => {
    let accessToken = await keychainData('');
    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }

    const appId = Config?.APPLICATION_ID;

    if (appId) {
      request.headers['x-app-id'] = appId;
    }
    return request;
  };

  const onResponseSuccess = (response: AxiosResponse) => response;

  const onResponseFailed = (error: AxiosError) => {
    return Promise.reject(error);
  };

  instance.interceptors.request.use(onRequest);
  instance.interceptors.response.use(onResponseSuccess, onResponseFailed);

  return instance;
};
