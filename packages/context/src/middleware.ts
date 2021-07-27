import { ContextManager } from '@zcong/context-async-hooks';
import { Request, Response } from 'express';
import { context, Context } from './context';

export const createContextMiddleware =
  (cm: ContextManager<Context> = context) =>
  async (req: Request, res: Response, next: () => void) => {
    const ctx: Context = {
      req,
      res,
    };

    cm.bind(ctx, req);
    cm.bind(ctx, res);

    cm.with(ctx, next);
  };
