import { INestApplication } from '@nestjs/common';
import { NEST_STACK_TRACER } from './tracer.constants';
import { createTracerMw } from './tracer.middleware';

export const setupTracer = (app: INestApplication) => {
  const tracer = app.get(NEST_STACK_TRACER);
  app.use(createTracerMw(tracer));
};
