import { reaction, IReactionDisposer, IReactionOptions, IReactionPublic } from 'mobx';

export class Reaction {
  private deposeList: IReactionDisposer[] = [];

  depose() {
    this.deposeList.forEach((depose) => depose());
    this.deposeList = [];
  }

  protected reaction<T, FireImmediately extends boolean = false>(
    expression: (r: IReactionPublic) => T,
    effect: (
      arg: T,
      prev: FireImmediately extends true ? T | undefined : T,
      r: IReactionPublic,
    ) => void,
    opts: IReactionOptions<T, FireImmediately> = {},
  ): IReactionDisposer {
    const depose = reaction(expression, effect, opts);
    this.deposeList.push(depose);
    return depose;
  }
}
