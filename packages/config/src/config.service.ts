import { Injectable, Inject } from '@nestjs/common';
import { ConfigOption } from './config.interfaces';
import { NEST_STACK_CONFIG_OPTIONS } from './config.constants';

@Injectable()
export class ConfigService<T = any> {
  private readonly configStore: Map<string, T> = new Map();

  constructor(@Inject(NEST_STACK_CONFIG_OPTIONS) private option: ConfigOption) {
    if (Object.keys(option).length === 0) {
      throw new Error('no config provided');
    }
    Object.keys(option).forEach((key: string) => {
      this.configStore.set(key, option[key] as T);
    });
  }

  getConfig(env: string = process.env.NODE_ENV): T | null {
    if (this.configStore.has(env)) {
      return this.configStore.get(env);
    }
    return this.configStore.get('default');
  }
}
