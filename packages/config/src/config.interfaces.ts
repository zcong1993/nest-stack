export type configFunc = () => any;

export interface ConfigOption {
  default: configFunc;
  prod?: configFunc;
  local?: configFunc;
  test?: configFunc;
}
