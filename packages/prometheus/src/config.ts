export interface Config {
  metricsPath?: string;
  collectDefaultMetrics?: boolean;
  defaultLabels?: Record<string, string>;
  requestDurationUseHistogram?: boolean;
  requestTotalMetricName?: string;
  requestDurationMetricName?: string;
  requestDurationHistogramBuckets?: number[];
}

export const defaultConfig: Config = {
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationUseHistogram: true,
};

export const mergeDefault = (c?: Config): Config => {
  return {
    ...defaultConfig,
    ...c,
  };
};
