import {
  Counter,
  Summary,
  register,
  collectDefaultMetrics,
  Histogram,
} from 'prom-client';
import { Request, Response } from 'express';

export const createHttpRequestCounter = () => {
  return new Counter({
    name: 'http_request_total',
    help: 'Counter for total requests received',
    labelNames: ['method', 'routerName', 'route', 'status', 'originStatus'],
  });
};

export const createRequestDuration = (useHistogram: boolean) => {
  if (useHistogram) {
    return new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'routerName', 'route', 'status', 'originStatus'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
    });
  }

  return new Summary({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'routerName', 'route', 'status', 'originStatus'],
  });
};

export const createMetricsHandler: () => (
  req: Request,
  res: Response,
) => void = () => {
  return (_: Request, res: Response) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(register.metrics());
  };
};

export const setupDefaultMetrics = () => {
  return collectDefaultMetrics();
};
