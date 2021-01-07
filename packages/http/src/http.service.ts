import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestContext } from '@zcong/nest-stack-context';
import { Observable, from } from 'rxjs';
import {
  Inject,
  HttpService as BaseHttpService,
} from '@nestjs/common';
import { Tracer, Tags, FORMAT_HTTP_HEADERS, globalTracer } from 'opentracing';
import {
  NEST_STACK_AXIOS_INSTANCE_TOKEN,
  NEST_STACK_HTTP_MODULE_OPTIONS,
} from './http.constants';
import { HttpModuleOptions } from './http.interfaces';

export class HttpTracingService extends BaseHttpService {
  private redirectHeaderKeys: string[];
  private readonly tracer: Tracer;
  private readonly config?: HttpModuleOptions;

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
      // 'x-b3-traceid',
      // 'x-b3-spanid',
      // 'x-b3-parentspanid',
      // 'x-b3-sampled',
      // 'x-b3-flags',
      // 'x-ot-span-context',
      'x-user',
    ];
    this.config = config;
    this.tracer = globalTracer();
  }

  request<T = any>(config: AxiosRequestConfig): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper((cc) => super.request(cc).toPromise(), c);
  }

  get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper((cc) => super.get(url, cc).toPromise(), c, url);
  }

  delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper((cc) => super.delete(url, cc).toPromise(), c, url);
  }

  head<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper((cc) => super.head(url, cc).toPromise(), c, url);
  }

  post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper(
      (cc) => super.post(url, data, cc).toPromise(),
      c,
      url,
    );
  }

  put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper(
      (cc) => super.put(url, data, cc).toPromise(),
      c,
      url,
    );
  }

  patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Observable<AxiosResponse<T>> {
    const c = this.injectRedirectHeadersToConfig(config);
    return this.traceWrapper(
      (cc) => super.patch(url, data, cc).toPromise(),
      c,
      url,
    );
  }

  private traceWrapper<T>(
    fn: (config: AxiosRequestConfig) => Promise<T>,
    config: AxiosRequestConfig,
    url?: string,
  ) {
    if (!this.config.withTracing) {
      return from(fn(config));
    }

    const span = (RequestContext.currentRequest() as any).span;

    if (!span) {
      return from(fn(config));
    }

    const newSpan = this.tracer.startSpan('curl', { childOf: span.context() });
    const headers = {
      ...config.headers,
    };

    newSpan.setTag(Tags.HTTP_URL, url || config.url);
    newSpan.setTag(Tags.HTTP_METHOD, (config.method || 'GET').toUpperCase());
    newSpan.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
    // Send span context via request headers (parent id etc.)
    this.tracer.inject(newSpan, FORMAT_HTTP_HEADERS, headers);
    config.headers = headers;

    return from(
      fn(config)
        .catch((err) => {
          newSpan.setTag(Tags.ERROR, true);
          throw err;
        })
        .finally(() => {
          newSpan.finish();
        }),
    );
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
