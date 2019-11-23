import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { RequestContext } from './context';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const res: Response = context.switchToHttp().getResponse();
        if (
          !res.headersSent &&
          !res.hasHeader('x-request-id') &&
          RequestContext.currentRequestId()
        ) {
          res.header('x-request-id', RequestContext.currentRequestId());
        }
        return data;
      }),
    );
  }
}
