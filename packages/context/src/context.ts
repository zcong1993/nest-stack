import { createAsyncContextManager } from '@zcong/context-async-hooks';
import { Request, Response } from 'express';

export interface Context {
  req: Request;
  res: Response;
}

export const context = createAsyncContextManager<Context>();
context.enable();
