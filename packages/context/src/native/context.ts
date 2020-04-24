import * as async_hooks from 'async_hooks';
import { Request } from 'express';
import { v4 as uuidV4 } from 'uuid';

// cause @types/node not add yet
const AsyncLocalStorage = (async_hooks as any).AsyncLocalStorage;

if (!AsyncLocalStorage) {
  throw new Error(
    `AsyncLocalStorage is not supported, node version should >= v13.10.0`,
  );
}

export const cls = new AsyncLocalStorage();

export class RequestContext {
  public request: Request;
  public response: Response;
  public requestId: string;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
    this.requestId = (request.headers['x-request-id'] as string) || uuidV4();
  }

  public static currentRequestContext(): RequestContext {
    return cls.getStore();
  }

  public static currentRequest(): Request {
    return RequestContext.currentRequestContext()?.request;
  }

  public static currentRequestId(): string {
    return RequestContext.currentRequestContext()?.requestId;
  }
}
