import { Injectable, Inject } from '@nestjs/common';
import { ConfigOption } from './config.interfaces';
import { NEST_STACK_CONFIG_OPTIONS } from './config.constants';

const validEnvs = ['prod', 'local', 'test'];

@Injectable()
export class ConfigService<T = any> {
  private readonly config: T;

  constructor(@Inject(NEST_STACK_CONFIG_OPTIONS) private option: ConfigOption) {
    if (Object.keys(option).length === 0) {
      throw new Error('no config provided');
    }
    const env = process.env.NODE_ENV || 'local';
    if (validEnvs.includes(env) && this.option[env]) {
      this.config = {
        ...option.default(),
        ...option[env](),
      };
    } else {
      this.config = option.default();
    }
  }

  getConfig(): T {
    return this.config;
  }
}
