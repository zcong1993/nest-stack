import { FORMAT_HTTP_HEADERS, Tags, globalTracer } from 'opentracing';
import { Request, Response } from 'express';

export const createTracerMw = () => (
  req: Request,
  res: Response,
  next: () => void,
) => {
  const tracer = globalTracer();
  // jaeger tracing
  const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);

  const span = tracer.startSpan('web-handler', {
    childOf: parentSpanContext,
    tags: { [Tags.SPAN_KIND]: Tags.SPAN_KIND_RPC_SERVER },
  });

  (req as any).span = span;
  const traceId = span.context()?.toTraceId();
  if (traceId) {
    res.setHeader('X-Trace-Id', traceId);
  }
  next();
  res.on('finish', () => {
    const status = res.statusCode;
    const matchedRoute = req.route?.path || req.route?.regexp?.source;
    const route = matchedRoute || '__no_matched';

    span.setTag(Tags.HTTP_STATUS_CODE, status);
    span.setTag(Tags.HTTP_METHOD, req.method);
    span.setTag(Tags.HTTP_URL, req.url);
    span.setTag('router', route);

    if (status >= 400) {
      span.setTag(Tags.ERROR, true);
    }
    span.finish();
  });
};
