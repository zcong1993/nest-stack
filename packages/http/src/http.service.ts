import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestContext } from '@zcong/nest-stack-context';
import { defer, Observable } from 'rxjs';
import { Inject } from '@nestjs/common';
import { AXIOS_INSTANCE_TOKEN, HTTP_MODULE_OPTIONS } from './http.constants';
import { HttpModuleOptions } from './http.interface';

export class HttpService {
  private redirectHeaderKeys: string[];

  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN)
    private readonly instance: AxiosInstance = Axios,
    @Inject(HTTP_MODULE_OPTIONS)
    private readonly config: HttpModuleOptions,
  ) {
    this.redirectHeaderKeys = config.redirectHeaderKeys || [
      'x-request-id',
      'x-b3-traceid',
      'x-b3-spanid',
      'x-b3-parentspanid',
      'x-b3-sampled',
      'x-b3-flags',
      'x-ot-span-context',
      'x-user',
    ];
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.request<T>(config));
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.get<T>(url, config));
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.delete(url, config));
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.head(url, config));
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.post(url, data, config));
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.put(url, data, config));
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    this.injectRedirectHeadersToConfig(config);
    return defer(() => this.instance.patch(url, data, config));
  }

  get axiosRef(): AxiosInstance {
    return this.instance;
  }

  private injectRedirectHeadersToConfig(config?: AxiosRequestConfig) {
    const reqContextHeaders = this.getRequestContextHeaders();
    if (!reqContextHeaders) {
      return config;
    }

    const c: AxiosRequestConfig = config || {};

    const tracingHeaders: any = {};
    this.redirectHeaderKeys.forEach((key: string) => {
      const val = reqContextHeaders[key];
      if (val) {
        tracingHeaders[key] = val;
      }
    });

    if (this.redirectHeaderKeys.includes('x-request-id')) {
      tracingHeaders['x-request-id'] = this.getRequestId();
    }

    const configHeaders: any = c.headers || {};
    const headers = {
      ...tracingHeaders,
      ...configHeaders,
    };
    c.headers = headers;
    return c;
  }

  private getRequestContextHeaders() {
    return (
      RequestContext.currentRequest() &&
      RequestContext.currentRequest()!.headers
    );
  }

  private getRequestId() {
    return RequestContext.currentRequestId();
  }
}
