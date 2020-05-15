import { register } from 'prom-client';
import { Request, Response } from 'express';
import { hrtime, nano2ms } from './util';
import { Config } from './config';
import { createHttpRequestCounter, createRequestDuration } from './prom';

export const promMw = (c: Config) => {
  if (c.defaultLabels) {
    register.setDefaultLabels(c.defaultLabels);
  }

  const requestCounter = createHttpRequestCounter();
  const requestDurationSummary = createRequestDuration(
    c.requestDurationUseHistogram,
  );

  return (req: Request, res: Response, next: any) => {
    if (req.path === c.metricsPath) {
      return next();
    }
    const startTime = hrtime();
    next();
    res.on('finish', () => {
      const dur = nano2ms(hrtime() - startTime);
      const method = req.method;
      const status = res.statusCode;
      const matchedRoute = req.route?.path || req.route?.regexp?.source;
      const route = matchedRoute || '__no_matched';
      const labels: Record<string, string> = {
        method,
        routerName: route,
        route,
        originStatus: `${status}`,
        status: c.statusNormalizer(res),
      };
      requestCounter.inc(labels, 1);
      requestDurationSummary.observe(labels, dur);
    });
  };
};
