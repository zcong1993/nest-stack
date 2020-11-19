import Axios from 'axios';
import { Module, DynamicModule, Provider } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { TracerModule } from '@zcong/nest-stack-tracing';
import {
  NEST_STACK_AXIOS_INSTANCE_TOKEN,
  NEST_STACK_HTTP_MODULE_ID,
  NEST_STACK_HTTP_MODULE_OPTIONS,
} from './http.constants';
import { HttpTracingService } from './http.service';
import {
  HttpModuleAsyncOptions,
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from './http.interfaces';

@Module({
  providers: [
    HttpTracingService,
    {
      provide: NEST_STACK_AXIOS_INSTANCE_TOKEN,
      useValue: Axios,
    },
  ],
  exports: [HttpTracingService],
})
export class HttpTracingModule {
  static register(
    config: HttpModuleOptions,
    global: boolean = false,
  ): DynamicModule {
    const imports = [];
    if (config.withTracing) {
      imports.push(TracerModule);
    }
    return {
      global,
      module: HttpTracingModule,
      providers: [
        {
          provide: NEST_STACK_HTTP_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        {
          provide: NEST_STACK_HTTP_MODULE_OPTIONS,
          useValue: config,
        },
      ],
      imports,
    };
  }

  static registerAsync(
    options: HttpModuleAsyncOptions,
    global: boolean = false,
  ): DynamicModule {
    return {
      global,
      module: HttpTracingModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: NEST_STACK_AXIOS_INSTANCE_TOKEN,
          useFactory: (config: HttpModuleOptions) => Axios.create(config),
          inject: [NEST_STACK_HTTP_MODULE_OPTIONS],
        },
        {
          provide: NEST_STACK_HTTP_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(
    options: HttpModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: HttpModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_STACK_HTTP_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: NEST_STACK_HTTP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpModuleOptionsFactory) =>
        optionsFactory.createHttpOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
