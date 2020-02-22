import { Injectable, Inject } from '@nestjs/common';
import * as extend from 'extend2';
import { ConfigOption } from './config.interfaces';
import { NEST_STACK_CONFIG_OPTIONS } from './config.constants';

const validEnvs = ['prod', 'local', 'test'];

@Injectable()
export class ConfigService<T = any> {
  private readonly config: T;

  constructor(@Inject(NEST_STACK_CONFIG_OPTIONS) option: ConfigOption) {
    if (Object.keys(option).length === 0) {
      throw new Error('no config provided');
    }
    const env = process.env.NODE_ENV || 'local';
    if (validEnvs.includes(env) && (option as any)[env]) {
      this.config = extend(true, {}, option.default(), (option as any)[env]());
    } else {
      this.config = {
        ...option.default(),
      };
    }
  }

  getConfig(): T {
    return this.config;
  }
}
