import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { Handler, HandlerTypes, useContextType, useEvent } from './handler';
import { memo } from './context2';


export interface ApiResources {}
export interface AppSyncApiResources {}
export interface ApiGatewayV1ApiResources {}

export type ApiHandlerTypes = Extract<HandlerTypes, 'api' | 'ws'>;

export class Response {
  constructor(public readonly result: APIGatewayProxyStructuredResultV2) {}
}

export const ApiHandler = (cb: Parameters<typeof Handler<'api'>>[1]) =>
{
  return Handler('api', async (evt, ctx) =>
  {
    let result: APIGatewayProxyStructuredResultV2 | undefined | void;

    try
    {
      result = await cb(evt, ctx);
    } 
    catch (e)
    {
      if (e instanceof Response)
      {
        result = e.result;
      } else throw e;
    }
    const serialized = useResponse().serialize(result || {});
    return serialized;
  });
}


export const useCookies = /* @__PURE__ */ memo(() =>
{
  const evt = useEvent('api');
  const cookies = evt.cookies || [];

  return Object.fromEntries(
    cookies.map((c) => c.split('=')).map(([k, v]) => [k, decodeURIComponent(v)])
  );
});

export const useCookie = (name: string) =>
{  
  const cookies = useCookies();
  return cookies[name] as string | undefined;
}

export const useBody = /* @__PURE__ */ memo(() =>
{
  const type = useContextType() as ApiHandlerTypes;
  const evt = useEvent(type);

  if (!evt.body) return;

  const body = evt.isBase64Encoded ? Buffer.from(evt.body, 'base64').toString() : evt.body;

  return body;
});

export const useJsonBody = /* @__PURE__ */ memo(() => {
  const body = useBody();
  if (!body) return;
  return JSON.parse(body);
});

export const useFormData = /* @__PURE__ */ memo(() => {
  const body = useBody();
  if (!body) return;
  const params = new URLSearchParams(body);
  return params;
});

export const usePath = /* @__PURE__ */ memo(() => {
  const evt = useEvent('api');
  return evt.rawPath.split('/').filter(Boolean);
});



interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}


export const useResponse = /* @__PURE__ */ memo(() =>
{
  useEvent('api');

  const response: APIGatewayProxyStructuredResultV2 = {
    headers: {},
    cookies: [],
  };

  const result = {
    cookies(values: Record<string, string>, options: CookieOptions)
    {
      for (const [key, value] of Object.entries(values))
      {
        result.cookie({
          key,
          value,
          ...options,
        });
      }

      return result;
    },
    cookie(
      input: {
        key: string;
        value: string;
        encrypted?: string;
      } & CookieOptions
    )
    {
      input = {
        secure: true,
        sameSite: 'None',
        httpOnly: true,
        ...input,
      };

      const value = encodeURIComponent(input.value);
      const parts = [input.key + '=' + value];

      if (input.domain) parts.push('Domain=' + input.domain);
      if (input.path) parts.push('Path=' + input.path);
      if (input.expires) parts.push('Expires=' + input.expires.toUTCString());
      if (input.maxAge) parts.push('Max-Age=' + input.maxAge);
      if (input.httpOnly) parts.push('HttpOnly');
      if (input.secure) parts.push('Secure');
      if (input.sameSite) parts.push('SameSite=' + input.sameSite);

      response.cookies!.push(parts.join('; '));

      return result;
    },
    status(code: number)
    {
      response.statusCode = code;
      return result;
    },
    header(key: string, value: string)
    {
      response.headers![key] = value;
      return result;
    },
    serialize(
      input: APIGatewayProxyStructuredResultV2
    ): APIGatewayProxyStructuredResultV2
    {
      return {
        ...response,
        ...input,
        cookies: [...(input.cookies || []), ...response.cookies!],
        headers: {
          ...response.headers,
          ...input.headers,
        },
      };
    },
  };
  return result;
});


export const useHeaders = (): Record<string, string | undefined> =>
{
  const type = useContextType() as ApiHandlerTypes;
  const evt = useEvent(type);
  return evt.headers || {};
}

export const useHeader = (key: string): string | undefined =>
{
  const headers = useHeaders();
  return headers[key];
}

export const useFormValue = (name: string) =>
{
  const params = useFormData();
  return params?.get(name);
}

export const useQueryParams = () =>
{
  const type = useContextType() as ApiHandlerTypes;
  const evt = useEvent(type);
  const query = evt.queryStringParameters || {};
  return query;
}

export const useQueryParam = <T = string>(name: string) =>
{
  return useQueryParams()[name] as T | undefined;
}

export const usePathParams = () =>
{
  const evt = useEvent('api');
  const path = evt.pathParameters || {};
  return path;
}

export const usePathParam = (name: string) =>
{
  return usePathParams()[name];
}
