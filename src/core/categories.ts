import { ApiReturnType, Client } from '@src/discourse/client.ts';
import { action, computed, IObservableArray, makeObservable, observable } from 'mobx';

export type Category =
  Exclude<Exclude<ApiReturnType<'listCategories'>['category_list'], undefined>['categories'], undefined>[number];


export class Categories {
  categories: IObservableArray<Category> = observable.array([], { deep: false });

  private readonly client: Client;

  loading = false;

  get export() {
    return {
      categories: this.categories.slice(),
      loading: this.loading,
    };
  }

  constructor(client: Client) {
    this.client = client;
    makeObservable(this, {
      categories: observable.ref,
      loading: observable,
      export: computed,
    });
  }

  @action
  async fetch() {
    this.loading = true;
    const categories = await this.client.listCategories(true as unknown as undefined); // fix
    this.categories.replace(categories?.category_list?.categories || []);
    this.loading = false;
  }
}
