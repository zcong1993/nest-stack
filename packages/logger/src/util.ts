import { transports, format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { INestApplication } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from './winston.constants';
import { nestLikeConsoleFormat } from './format';

const isProdByEnv: () => boolean = () => process.env.NODE_ENV === 'prod';

export const createDefaultLogConfig = (isProd: () => boolean = isProdByEnv) => {
  if (isProd()) {
    return {
      transports: [
        new DailyRotateFile({
          createSymlink: true,
          symlinkName: 'combine.log',
          filename: 'combine-%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          dirname: './logs',
          level: 'info',
          maxSize: '100m',
          maxFiles: '10d',
        }),
        new transports.File({
          filename: 'error.log',
          dirname: './logs',
          level: 'error',
        }),
      ],
    };
  }

  return {
    transports: [
      new transports.Console({
        format: format.combine(format.timestamp(), nestLikeConsoleFormat()),
      }),
    ],
  };
};

export const setupLogger = (app: INestApplication) => {
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
};
