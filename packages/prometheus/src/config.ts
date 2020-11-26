import { Response } from 'express';

export type Status = '2xx' | '3xx' | '4xx' | '5xx';

export type RouteNormalizer = (route: string) => string;
export type StatusNormalizer = (res: Response) => Status;

export interface Config {
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  defaultLabels?: Record<string, string>;
  statusNormalizer?: StatusNormalizer;
  requestDurationUseHistogram?: boolean;
  requestTotalMetricName?: string;
  requestDurationMetricName?: string;
}

export const defaultStatusNormalizer: StatusNormalizer = (res) => {
  const status = res.statusCode;

  if (status >= 200 && status < 300) {
    return '2xx';
  }

  if (status >= 300 && status < 400) {
    return '3xx';
  }

  if (status >= 400 && status < 500) {
    return '4xx';
  }

  return '5xx';
};

export const defaultConfig: Config = {
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  statusNormalizer: defaultStatusNormalizer,
  requestDurationUseHistogram: true,
};

export const mergeDefault = (c?: Config): Config => {
  return {
    ...defaultConfig,
    ...c,
  };
};
