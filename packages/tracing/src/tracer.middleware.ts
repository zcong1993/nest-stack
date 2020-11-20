import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Tracer, FORMAT_HTTP_HEADERS, Tags } from 'opentracing';
import { NEST_STACK_TRACER } from './tracer.constants';

export const createTracerMw = (tracer: Tracer) => (
  req: any,
  res: any,
  next: () => void,
) => {
  // jaeger tracing
  const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

  const span = tracer.startSpan('web-handler', {
    childOf: parentSpanContext,
    tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER },
  });

  req.span = span;
  next();
  res.on('finish', () => {
    const status = res.statusCode;
    const matchedRoute = req.route?.path || req.route?.regexp?.source;
    const route = matchedRoute || '__no_matched';
    span.setTag(Tags.HTTP_STATUS_CODE, status);
    if (status >= 400) {
      span.setTag(Tags.ERROR, true);
    }
    span.setTag('route', route);
    span.finish();
  });
};

@Injectable()
export class TracerMiddleware implements NestMiddleware {
  private readonly mw: (req: any, res: any, next: () => void) => void;
  constructor(@Inject(NEST_STACK_TRACER) private readonly tracer: Tracer) {
    this.mw = createTracerMw(tracer);
  }

  use(req: any, res: any, next: () => void) {
    this.mw(req, res, next);
  }
}
