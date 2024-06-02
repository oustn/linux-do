const { fetch } = require('undici');
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { exec } = require('child_process');
const _ = require('lodash')

function resolveDir(pathname) {
  return resolve(__dirname, '..', pathname);
}

const source = resolveDir('./lib/openapi.json');
const target = resolveDir('./src/discourse/openapi.d.ts');

async function downloadOpenApi() {
  const api = await fetch('https://docs.discourse.org/openapi.json')
    .then(response => response.json());

  writeFileSync(source, JSON.stringify(api, null, 2));
  return api;
}

async function generateTypes() {
  exec(`npx openapi-typescript ${source} --output ${target}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
  });
}

function transformBody(body, method, path) {
  const transformed = [];
  if (!body || !body.content) return [];
  for (const [type, { schema } = {}] of Object.entries(body.content)) {
    const data = {
      contentType: type,
      fields: [],
      all: false,
    };
    const { properties, required } = schema;

    if (!properties) continue;
    if (Array.isArray(required) && required.length <= 4 && required.length > 0) {
      required.forEach(r => {
        data.fields.push({
          name: r,
          required: true,
          type: properties[r].type,
          str: `@Body('${r}') ${_.camelCase(r)}: ApiBody<paths, '${method}', '${path}'>['${r}']`
        });
      });
    }
    if (Object.keys(properties).length > 4) {
      data.all = true;
    } else {
      for (const [name, prop] of Object.entries(properties)) {
        if (!Array.isArray(required) || !required.includes(name)) {
          data.fields.push({
            name,
            required: false,
            type: prop.type,
            str: `@Body('${name}') ${_.camelCase(name)}?: ApiBody<paths, '${method}', '${path}'>['${name}']`
          });
        }
      }
    }
    transformed.push(data);
  }
  return transformed.filter(d => d.contentType === 'application/json')
}

function generateApi(apis) {
  const data = [];

  for (const [path, handlers] of Object.entries(apis.paths)) {
    for (const [method, handler] of Object.entries(handlers)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        const api = {
          name: handler.operationId,
          method,
          path,
          pathParams: [],
          queryParams: [],
          headers: [],
          body: null,
        };

        if (Array.isArray(handler.parameters)) {
          for (const param of handler.parameters) {
            if (param.in === 'path') {
              api.pathParams.push({
                name: param.name,
                in: param.in,
                required: param.required,
                type: param.schema.type,
                jsName: _.camelCase(param.name),
                decoratorName: `@Param('${param.name}')`,
                str: `@Param('${param.name}') ${_.camelCase(param.name)}${param.required ? '' : '?'}: ApiParams<paths, '${method}', '${path}'>['${param.name}']`
              });
            } else if (param.in === 'query') {
              api.queryParams.push({
                name: param.name,
                in: param.in,
                required: param.required,
                type: param.schema.type,
                str: `@Query('${param.name}') ${_.camelCase(param.name)}${param.required ? '' : '?'}: AipQuery<paths, '${method}', '${path}'>['${param.name}']`
              });
            } else if (param.in === 'header') {
              api.headers.push({
                name: param.name,
                in: param.in,
                required: param.required,
                type: param.schema.type,
              });
            }
          }
        }

        api.pathParams.sort((a, b) => a.required === b.required ? 0 : a.required ? -1 : 1);
        api.queryParams.sort((a, b) => a.required === b.required ? 0 : a.required ? -1 : 1);

        if (handler.requestBody) {
          api.body = transformBody(handler.requestBody, method, path);
        }
        data.push(api);
      }
    }
  }
  return data;
}

function generateApiParams(api) {
  const params = []
  for (const param of api.pathParams) {
    params.push(param.str);
  }
  if ((params.length > 0 && api.queryParams.length > 0) || api.queryParams.length > 4) {
    params.push(`@Query() query: AipQuery<paths, '${api.method}', '${api.path}'>`)
  } else if (api.queryParams.length > 0 ) {
    params.push(...api.queryParams.map(p => p.str))
  }
  if (api.body) {
    if (params.length > 0 || ((!api.body.fields || !api.body.fields.length) && api.body.all)) {
      params.push(`@Body() body: ApiBody<paths, '${api.method}', '${api.path}'>`)
    } else if (api.body.fields && api.body.fields.length) {
      params.push(...api.body.fields.map(f => f.str))
    } else if (api.body.all) {
      params.push(`@Body() body: ApiBody<paths, '${api.method}', '${api.path}'>`)
    }
  }

  if (!params.length) return '()'
  return `(
    ${params.map(p => `${p}`).join(',\n    ')}
  )`
}

function generateApiFunction(api) {
  return `  @${_.capitalize(api.method)}('${api.path}')
  ${api.name}${generateApiParams(api)} {
    return this.fetch<paths, '${api.method}', '${api.path}'>()
  }
`
}

function generateClient(apis) {
  const code = `// This file is generated by lib/generate.cjs
/* eslint @typescript-eslint/no-unused-vars: 0 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { FetchResponse, MaybeOptionalInit } from 'openapi-fetch';
import type { HasRequiredKeys, HttpMethod, MediaType, PathsWithMethod } from 'openapi-typescript-helpers';

import {
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Delete,
} from './decorators';

import type { paths } from './schema';

export type PathMethods = Partial<Record<HttpMethod, object>>;

export {
  HttpMethod,
  PathsWithMethod,
}

export type ApiInits<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>> =
  HasRequiredKeys<MaybeOptionalInit<Paths[P], M>> extends never ? (MaybeOptionalInit<Paths[P], M> & {
    [key: string]: unknown
  }) | undefined : MaybeOptionalInit<Paths[P], M>

export type ApiResponse<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>> =
  Promise<FetchResponse<Paths[P][M], MaybeOptionalInit<Paths[P], M>, MediaType>['data']>

export type AipQuery<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>> =
  ApiInits<Paths, M, P> extends { params: { query?: infer Q } } ? Q : never;

export type ApiParams<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>> =
  ApiInits<Paths, M, P> extends { params: { path?: infer Q } } ? Q : never;

export type ApiBody<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>> =
  ApiInits<Paths, M, P> extends { body?: infer Q } ? Q : never;

export abstract class ApiClient {
  protected async fetch<Paths extends Record<keyof Paths, PathMethods>, M extends HttpMethod, P extends PathsWithMethod<Paths, M>>(
    type?: M,
    path?: P,
    init?: ApiInits<Paths, M, P>
  ): ApiResponse<Paths, M, P> {
    throw new Error('Not implemented');
  }
  
${apis.map(generateApiFunction).join('\n')}}
`
  writeFileSync(resolveDir('./src/discourse/abstract-client.ts'), code);
}

(async () => {
  const data = await downloadOpenApi();
  await generateTypes();
  const api = generateApi(data);
  generateClient(api)
})();
