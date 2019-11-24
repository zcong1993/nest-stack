import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigOption } from './config.interfaces';
import { NEST_STACK_CONFIG_OPTIONS } from './config.constants';

@Module({})
export class ConfigModule {
  static registry(option: ConfigOption): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: NEST_STACK_CONFIG_OPTIONS,
          useValue: option,
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
