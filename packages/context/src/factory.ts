import { ContinuationLocalStorage } from 'asyncctx';

export class ContextStorage<T = any> {
  private store = new ContinuationLocalStorage<T>();

  setContext(value: T) {
    return this.store.setContext(value);
  }

  getContext() {
    return this.store.getContext();
  }
}
