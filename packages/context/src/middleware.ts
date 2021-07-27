import { ContextManager } from '@zcong/context-async-hooks';
import { Request, Response } from 'express';
import { context, Context } from './context';

export const createContextMiddleware =
  (cm: ContextManager<Context> = context) =>
  async (req: Request, res: Response, next: () => void) => {
    const context: Context = {
      req,
      res,
    };

    cm.bind(context, req);
    cm.bind(context, res);

    cm.with(context, next);
  };
