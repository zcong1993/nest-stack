import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestContext } from '@zcong/nest-stack-context';
import { defer, Observable } from 'rxjs';
import { Inject, HttpService as BaseHttpService } from '@nestjs/common';
import {
  NEST_STACK_AXIOS_INSTANCE_TOKEN,
  NEST_STACK_HTTP_MODULE_OPTIONS,
} from './http.constants';
import { HttpModuleOptions } from './http.interface';

export class HttpTracingService extends BaseHttpService {
  private redirectHeaderKeys: string[];

  constructor(
    @Inject(NEST_STACK_HTTP_MODULE_OPTIONS)
    config?: HttpModuleOptions,
    @Inject(NEST_STACK_AXIOS_INSTANCE_TOKEN)
    instance?: AxiosInstance,
  ) {
    if (config) {
      instance = Axios.create(config);
    }
    super(instance);
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
    const c = this.injectRedirectHeadersToConfig(config);
    return super.request(c);
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.get(url, c);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.delete(url, c);
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.head(url, c);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.post(url, c);
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.put(url, c);
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return super.patch(url, c);
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
