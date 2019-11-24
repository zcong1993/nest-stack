import { AxiosRequestConfig } from 'axios';
import { ModuleMetadata, Provider, Type } from '@nestjs/common/interfaces';

export interface HttpModuleOptions extends AxiosRequestConfig {
  redirectHeaderKeys?: string[];
}

export interface HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HttpModuleOptionsFactory>;
  useClass?: Type<HttpModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<HttpModuleOptions> | HttpModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
