import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatusCodes?: number[];
}

@Injectable()
export class ApiClientService {
  private readonly logger = new Logger(ApiClientService.name);
  private clients: Map<string, AxiosInstance> = new Map();

  createClient(
    baseURL: string,
    config?: AxiosRequestConfig & { retry?: RetryConfig },
  ): AxiosInstance {
    const clientKey = baseURL;
    if (this.clients.has(clientKey)) {
      return this.clients.get(clientKey)!;
    }

    const client = axios.create({
      baseURL,
      timeout: 30000,
      ...config,
    });

    // Add request interceptor for logging
    client.interceptors.request.use(
      (config) => {
        this.logger.debug(`Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor with retry logic
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const retryConfig = config?.retry || {
          maxRetries: 3,
          retryDelay: 1000,
          retryableStatusCodes: [408, 429, 500, 502, 503, 504],
        };

        const requestConfig = error.config as any;
        if (!requestConfig || !requestConfig.retry) {
          requestConfig.retry = 0;
        }

        if (
          requestConfig.retry < retryConfig.maxRetries! &&
          retryConfig.retryableStatusCodes!.includes(
            error.response?.status || 0,
          )
        ) {
          requestConfig.retry += 1;
          const delay =
            retryConfig.retryDelay! * Math.pow(2, requestConfig.retry - 1);

          this.logger.warn(
            `Retrying request (${requestConfig.retry}/${retryConfig.maxRetries}): ${requestConfig.url}`,
          );

          await this.sleep(delay);
          return client(requestConfig);
        }

        this.logger.error(
          `API request failed: ${error.message}`,
          error.response?.data,
        );
        return Promise.reject(this.handleError(error));
      },
    );

    this.clients.set(clientKey, client);
    return client;
  }

  private handleError(error: AxiosError): HttpException {
    if (error.response) {
      return new HttpException(
        {
          message: error.message,
          statusCode: error.response.status,
          data: error.response.data,
        },
        error.response.status,
      );
    } else if (error.request) {
      return new HttpException(
        {
          message: 'No response received from API',
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      return new HttpException(
        {
          message: error.message,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const client = this.createClient(config?.baseURL || '');
    const response = await client.get<T>(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const client = this.createClient(config?.baseURL || '');
    const response = await client.post<T>(url, data, config);
    return response.data;
  }
}

