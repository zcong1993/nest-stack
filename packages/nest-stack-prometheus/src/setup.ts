import { INestApplication } from '@nestjs/common';
import { Config, mergeDefault } from './config';
import { promMw } from './mw';
import { createMetricsHandler, setupDefaultMetrics } from './prom';

export const setupProm = (app: INestApplication, config?: Config) => {
  const c = mergeDefault(config);

  app.use(promMw(c));

  const handler = createMetricsHandler();

  app.use(async (req: any, res: any, next: any) => {
    if (req.path !== c.metricsPath) {
      await next();
      return;
    }
    await handler(req, res);
  });

  if (c.collectDefaultMetrics) {
    setupDefaultMetrics();
  }
};
