import { RequestContext, cls } from './context';

export const createContextMiddleware = () => async (
  req: any,
  res: any,
  next: () => void,
) => {
  const requestContext = new RequestContext(req, res);
  cls.run(requestContext, () => {
    next();
  });
};
