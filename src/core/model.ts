import { Client } from '@src/discourse/client.ts';

export abstract class Model {
  private csrfToken = '';

  constructor(protected readonly client: Client) {
  }

  protected async getCsrfToken(id: number | string) {
    if (!this.csrfToken) {
      this.csrfToken = await this.client.getCsrfToken(id);
    }
    return this.csrfToken;
  }

}
