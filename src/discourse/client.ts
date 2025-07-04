import createClient, { FetchResponse, MaybeOptionalInit } from 'openapi-fetch';
import * as cheerio from 'cheerio';

import type { paths } from './schema';

import {
  ApiClient,
  PathMethods,
  HttpMethod,
  PathsWithMethod,
  ApiResponse,
  ApiInits,
  ApiParams,
} from './abstract-client.ts';
import {
  DiscourseError,
  NotFoundError,
  TooManyRequests,
  UnauthenticatedError,
  UnprocessableEntityError,
} from '@src/discourse/errors.ts';
import type { MediaType } from 'openapi-typescript-helpers';
import { Get, Param, Override, Post, Header, Body, Put } from '@src/discourse/decorators';

export class Client extends ApiClient {
  private readonly client: ReturnType<typeof createClient<paths>>;

  private TIMEOUT = 60;

  private get headers() {
    const headers = new Headers();
    headers.set('User-Agent', 'Discourse API Client');
    if (this.apiKey) {
      headers.set('Api-Key', this.apiKey);
    }
    if (this.apiUsername) {
      headers.set('Api-Username', this.apiUsername);
    }
    return headers;
  }

  constructor(
    private readonly host: string,
    private readonly apiKey?: string,
    private readonly apiUsername?: string,
  ) {
    super();
    this.client = createClient<paths>({ baseUrl: host, headers: this.headers });
  }

  private async innerFetch<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>>(
    method?: M,
    path?: P,
    init?: ApiInits<Paths, M, P>,
    // @ts-expect-error fuck
  ): Promise<FetchResponse<Paths[P][M], MaybeOptionalInit<Paths[P], M>, MediaType>> {
    if (!method || !path || !init) {
      throw new Error('Invalid fetch call');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('Timeout'), this.TIMEOUT * 1000);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const data = await this.client[method.toUpperCase()](path, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return data;
  }

  async fetch<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>>(
    method?: M,
    path?: P,
    init?: ApiInits<Paths, M, P>,
  ): ApiResponse<Paths, M, P> {
    const { data, response } = await this.innerFetch<Paths, M, P>(method, path, init);
    this.processError(response);
    return data as ApiResponse<Paths, M, P>;
  }

  private processError(response: Response) {
    switch (response.status) {
      case 403:
        throw new UnauthenticatedError(response);
      case 404:
      case 410:
        throw new NotFoundError(response);
      case 422:
        throw new UnprocessableEntityError(response);
      case 429:
        throw new TooManyRequests(response);
      default: {
        if (response.status >= 500) {
          throw new DiscourseError('Server error', response);
        }
      }
    }
  }

  async getCurrentUsername(): Promise<string | null> {
    const { response } = await this.innerFetch<paths, 'get', '/about.json'>('get', '/about.json', {});
    try {
      this.processError(response);
    } catch (e) {
      return null;
    }
    const headers = response.headers;
    const username = headers.get('X-Discourse-Username');
    return username ?? null;
  }

  @Get('/u/{username}/summary.json')
  getUserSummary(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('username') _username: ApiParams<paths, 'get', '/u/{username}/summary.json'>['username'],
  ) {
    return this.fetch<paths, 'get', '/u/{username}/summary.json'>();
  }

  @Override('getNotifications', {
    params: {
      query: {
        filter: 'unread',
      },
    },
  })
  getUnreadNotifications() {
    return this.getNotifications();
  }

  @Get('/topics/private-messages-unread/{username}.json')
  listUnreadUserPrivateMessages(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('username') _username: ApiParams<paths, 'get', '/topics/private-messages/{username}.json'>['username'],
  ) {
    return this.fetch<paths, 'get', '/topics/private-messages/{username}.json'>();
  }

  @Post('/topics/timings')
  timings(
    @Body() _body: ApiParams<paths, 'post', '/topics/timings'>,
    @Header('x-csrf-token') _csrfToken: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Header('content-type') _contentType: string = 'application/x-www-form-urlencoded; charset=UTF-8',
  ) {
    return this.fetch<paths, 'post', '/topics/timings'>();
  }

  @Put('/discourse-reactions/posts/{id}/custom-reactions/{reaction}/toggle.json')
  toggleLike(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('id') _id: ApiParams<paths, 'put', '/discourse-reactions/posts/{id}/custom-reactions/{reaction}/toggle.json'>['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('reaction') _reaction: ApiParams<paths, 'put', '/discourse-reactions/posts/{id}/custom-reactions/{reaction}/toggle.json'>['reaction'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Header('x-csrf-token') _csrfToken: string,
  ) {
    return this.fetch<paths, 'put', '/discourse-reactions/posts/{id}/custom-reactions/{reaction}/toggle.json'>();
  }

  async getCsrfToken(id: number | string) {
    const response = await fetch(new URL(`/t/topic/${id}`, this.host));
    const html = await response.text();
    const $ = cheerio.load(html);
    const meta = $('meta[name=csrf-token]');
    if (!meta.length) return '';
    return meta.attr('content') || '';
  }
}

export type ApiReturnType<T extends keyof InstanceType<typeof Client>> =
  Exclude<Awaited<ReturnType<InstanceType<typeof Client>[T]>>, undefined>
