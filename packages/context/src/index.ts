import * as async_hooks from 'async_hooks';
import {
  RequestContext as RequestContextCls,
  cls as clsCls,
  RequestIdInterceptor as RequestIdInterceptorCls,
  createContextMiddleware as createContextMiddlewareCls,
  setupContext as setupContextCls,
} from './cls';
import {
  RequestContext as RequestContextNative,
  cls as clsNavive,
  RequestIdInterceptor as RequestIdInterceptorNative,
  createContextMiddleware as createContextMiddlewareNative,
  setupContext as setupContextNative,
} from './native';

const canUseNative = (): boolean => {
  const AsyncLocalStorage = (async_hooks as any).AsyncLocalStorage;
  return AsyncLocalStorage !== undefined;
};

export const RequestContext = ((canUseNative()
  ? RequestContextNative
  : RequestContextCls) as any) as typeof RequestContextCls;
export const cls = ((canUseNative() ? clsCls : clsNavive) as any) as
  | typeof clsCls
  | typeof clsNavive;
export const RequestIdInterceptor = ((canUseNative()
  ? RequestIdInterceptorCls
  : RequestIdInterceptorNative) as any) as typeof RequestIdInterceptorCls;
export const createContextMiddleware = ((canUseNative()
  ? createContextMiddlewareCls
  : createContextMiddlewareNative) as any) as typeof createContextMiddlewareCls;
export const setupContext = ((canUseNative()
  ? setupContextCls
  : setupContextNative) as any) as typeof setupContextCls;
