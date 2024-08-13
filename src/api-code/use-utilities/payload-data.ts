import { useHeader, useJsonBody, usePathParams } from 'sst/node/api';
import { ZodDiscriminatedUnionOption, ZodRawShape, z } from 'zod';
import { ApiResponseThrowable } from '../throw-utilities/responses';
import * as ZodPackageJson from 'zod/package.json';
import { updateZodLanguage } from '../framework-tools/zod';
import { Locale } from '@formatjs/intl-locale'


type UnionTypesType<D extends string> = [
  ZodDiscriminatedUnionOption<D>,
  ...ZodDiscriminatedUnionOption<D>[]
];

export const useValidatedPayloadOptions = <D extends string, T extends UnionTypesType<D>>(zodObject: z.ZodDiscriminatedUnion<D, T>) =>
{  
    const languageCode = usePathLanguageCode();
    updateZodLanguage(languageCode);
    const body = useJsonBody();
  
    if (!body)
    {
      throw new ApiResponseThrowable({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Did not receive a payload.',
        },
      });
    }
  
    const response = zodObject.safeParse(body);
  
    if (response.success)
    {
      return response.data;
    }
  
    throw new ApiResponseThrowable({
      success: false,
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'The payload does not match the expected schema.',
      },
      zod: {
        version: ZodPackageJson.version,
        issues: response.error.issues,
      }
    });
  
  }



export const useValidatedPayload = <T extends ZodRawShape>(zodObject: z.ZodObject<T>) =>
{




  const languageCode = usePathLanguageCode();
  updateZodLanguage(languageCode);
  const body = useJsonBody();

  if (!body)
  {
    throw new ApiResponseThrowable({
      success: false,
      error: {
        code: 'INVALID_PAYLOAD',
        message: 'Did not receive a payload.',
      },
    });
  }

  const response = zodObject.safeParse(body);

  if (response.success)
  {
    return response.data;
  }

  throw new ApiResponseThrowable({
    success: false,
    error: {
      code: 'INVALID_PAYLOAD',
      message: 'The payload does not match the expected schema.',
    },
    zod: {
      version: ZodPackageJson.version,
      issues: response.error.issues,
    }
  });

}

export const usePathLanguageCode = (pathLocaleParamKey: string = 'locale'): string =>
{
  const localeString = usePathLocale(pathLocaleParamKey);
  const locale = new Locale(localeString)
  return locale.language;
}

export const usePathLocale = (pathParamKey: string = 'locale'): string =>
{
  return usePathParam(pathParamKey);
}



export const usePathId = (): string =>
{
  return usePathParam('id');
}

export const usePathParam = (name: string): string =>
{
  const value = usePathParamAllowEmpty(name);

  if (!value || value === '')
  {
    throw new Error(`Path parameter ${name} is required.`);
  }

  return value;
}

export const usePathParamAllowEmpty = (name: string): string | undefined =>
{
  const value = usePathParams()[name];

  if (!value || value === '')
  {
    return undefined;
  }

  return value;
}



export const useAuthorizationHeader = () =>
{
  return useHeader('Authorization') ?? useHeader('authorization');
}

/**
 * Get the bearer token from the authorization header. If the auth header is not
 * present or not a bearer token, null will be returned.
 */
export const useBearerToken = () =>
{
  const authHeader = useAuthorizationHeader();

  if (!authHeader)
  {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2)
  {
    return null;
  }

  if (parts[0] !== 'Bearer')
  {
    return null;
  }

  return parts[1];
}