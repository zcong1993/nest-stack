import { green, yellow } from 'colors/safe';
import { format } from 'winston';

export const nestLikeConsoleFormat = () =>
  format.printf(
    ({ context, level, timestamp, message, requestId, ...meta }) => {
      return (
        `${green('[NestWinston]')} ` +
        `${yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
        ('undefined' !== typeof timestamp
          ? `${new Date(timestamp).toLocaleString()} `
          : '') +
        ('undefined' !== typeof context
          ? `${yellow('[' + context + ']')} `
          : '') +
        (!!requestId ? `${requestId} ` : '') +
        `${green(message)} - ` +
        `${JSON.stringify(meta)}`
      );
    },
  );
