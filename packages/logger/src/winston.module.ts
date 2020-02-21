import { DynamicModule, Global, LoggerService, Module } from '@nestjs/common';
import {
  WinstonModuleAsyncOptions,
  WinstonModuleOptions,
} from './winston.interfaces';
import {
  createNestWinstonLogger,
  createWinstonAsyncProviders,
  createWinstonProviders,
} from './winston.providers';

@Global()
@Module({})
export class WinstonModule {
  public static forRoot(options: WinstonModuleOptions): DynamicModule {
    const providers = createWinstonProviders(options);

    return {
      providers,
      module: WinstonModule,
      exports: providers,
    };
  }

  public static forRootAsync(
    options: WinstonModuleAsyncOptions,
  ): DynamicModule {
    const providers = createWinstonAsyncProviders(options);

    return {
      providers,
      module: WinstonModule,
      imports: options.imports,
      exports: providers,
    } as DynamicModule;
  }

  public static createLogger(options: WinstonModuleOptions): LoggerService {
    return createNestWinstonLogger(options);
  }
}
