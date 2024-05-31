import 'reflect-metadata';

type ParameterType = 'param' | 'query' | 'body';

const ParameterMetadataKey = Symbol('ParameterMetadataKey');


interface ParameterPayload {
  type: ParameterType;
  name?: string;
  index: number;
}

interface Init {
  body?: Record<string, unknown> | unknown;

  credentials?: RequestCredentials;

  params?: {
    path?: {
      [key: string]: unknown;
    }
    query?: {
      [key: string]: unknown;
    }
  };
}

interface Client {
  fetch(type: string, path: string, init: Init): Promise<unknown>;
}

export function Get(path: string): MethodDecorator {
  return MethodDecorator('get', path);
}

export function Post(path: string): MethodDecorator {
  return MethodDecorator('post', path);
}

export function Put(path: string): MethodDecorator {
  return MethodDecorator('put', path);
}

export function Delete(path: string): MethodDecorator {
  return MethodDecorator('delete', path);
}

export function Param(name?: string): ParameterDecorator {
  return ParameterDecorator('param', name);
}

export function Query(name?: string): ParameterDecorator {
  return ParameterDecorator('query', name);
}

export function Body(name?: string): ParameterDecorator {
  return ParameterDecorator('body', name);
}

function MethodDecorator(type: string, path: string): MethodDecorator {
  return (target: object, propertyKey: string | symbol | undefined, descriptor: PropertyDescriptor) => {
    descriptor.value = async function(...rest: unknown[]) {
      const parameters: ParameterPayload[] = Reflect.getOwnMetadata(ParameterMetadataKey, target, propertyKey!) || [];
      const init: Init = {
        credentials: 'include'
      };
      for (const parameter of parameters) {
        if (parameter.type === 'param' && parameter.name) {
          init.params = init.params || {};
          init.params.path = init.params.path || {};
          init.params.path[parameter.name] = rest[parameter.index];
        } else if (parameter.type === 'query') {
          init.params = init.params || {};
          init.params.query = init.params.query || {};
          if (parameter.name) {
            init.params.query[parameter.name || parameter.index] = rest[parameter.index];
          } else {
            init.params.query = rest[parameter.index] as Record<string, unknown>;
          }
        } else if (parameter.type === 'body') {
          if (parameter.name) {
            init.body = init.body || {};
            (init.body as Record<string, unknown>)[parameter.name] = rest[parameter.index];
          } else {
            init.body = rest[parameter.index];
          }
        }
      }

      if (type === 'get' && init.body) {
        init.params = init.params || {};
        init.params.query = init.params.query || {};
        Object.entries(init.body as Record<string, unknown>).forEach(([key, value]) => {
          let id = key
          if (Array.isArray(value)) {
            id = `${key}[]`
          }
          init.params!.query![id] = value;
        })
        init.body = undefined
      }

      return (this as Client).fetch(type, path, init);
    };
  };
}

function ParameterDecorator(type: ParameterType, name?: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) return;
    const parameters: ParameterPayload[] = Reflect.getOwnMetadata(ParameterMetadataKey, target, propertyKey!) || [];
    parameters.push({
      type,
      name,
      index: parameterIndex,
    });
    Reflect.defineMetadata(ParameterMetadataKey, parameters, target, propertyKey!);
  };
}
