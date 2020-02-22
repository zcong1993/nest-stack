export const hrtime2nano = (ht: [number, number]): number =>
  ht[0] * 1e9 + ht[1];

export const hrtime = () => hrtime2nano(process.hrtime());

export const nano2ms = (nano: number): number => nano / 1e6;
