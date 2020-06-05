import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { initTracer } from 'jaeger-client';
import { InitTracingConfig } from './tracer.interfaces';
import { NEST_STACK_TRACER } from './tracer.constants';

@Global()
@Module({})
export class TracerModule {
  static registry(opts: InitTracingConfig): DynamicModule {
    const tracer = initTracer(opts.config, opts.options);
    const provider: Provider = {
      provide: NEST_STACK_TRACER,
      useValue: tracer,
    };

    return {
      module: TracerModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
