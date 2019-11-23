import { ContinuationLocalStorage } from 'asyncctx';
import { Request } from 'express';
import { v4 as uuidV4 } from 'uuid';

export const cls = new ContinuationLocalStorage<RequestContext>();

export class RequestContext {
  public request: Request;
  public response: Response;
  public requestId: string;

  constructor(request: Request, response: Response) {
    this.request = request;
    this.response = response;
    this.requestId = request.header['x-request-id'] || uuidV4();
  }

  public static currentRequestContext(): RequestContext {
    return cls.getContext();
  }

  public static currentRequest(): Request | null {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext!.request;
    }

    return null;
  }

  public static currentRequestId(): string {
    return RequestContext.currentRequestContext()!.requestId;
  }
}
