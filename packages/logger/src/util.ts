import { transports, format } from 'winston';
import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from './winston.constants';

const isProdByEnv: () => boolean = () => process.env.NODE_ENV === 'prod';

export const createDefaultLogConfig = (isProd: () => boolean = isProdByEnv) => {
  const prettyFormat = format.combine(
    format.colorize(),
    format.align(),
    format.simple(),
  );

  const jsonFormat = format.json();
  const outputFormat = isProd() ? jsonFormat : prettyFormat;

  return {
    format: format.combine(format.timestamp(), outputFormat),
    transports: [new transports.Console()],
  };
};

export const setupLogger = (app: INestApplication) => {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
};
