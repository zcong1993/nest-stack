import { TracingOptions, TracingConfig } from 'jaeger-client';

export interface InitTracingConfig {
  config?: TracingConfig;
  options?: TracingOptions;
}
