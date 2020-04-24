import { INestApplication } from '@nestjs/common';
import { createContextMiddleware } from './middleware';
import { RequestIdInterceptor } from './interceptor';

export const setupContext = (app: INestApplication) => {
  app.use(createContextMiddleware());
  app.useGlobalInterceptors(new RequestIdInterceptor());
};
