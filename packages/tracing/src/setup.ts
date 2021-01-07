import { INestApplication } from '@nestjs/common';
import { initTracer } from 'jaeger-client';
import { initGlobalTracer } from 'opentracing';
import { InitTracingConfig } from './tracer.interfaces';
import { createTracerMw } from './tracer.middleware';

export const setupTracing = (
  app: INestApplication,
  opts: InitTracingConfig,
) => {
  const tracer = initTracer(opts.config, opts.options);
  initGlobalTracer(tracer);
  app.use(createTracerMw());
};
