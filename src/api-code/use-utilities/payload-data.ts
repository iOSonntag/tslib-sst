import { useHeader, useJsonBody, usePathParams, useQueryParam } from '../sst-v2/api';
import { ZodDiscriminatedUnionOption, ZodRawShape, z } from 'zod';
import { ApiResponseThrowable } from '../throw-utilities/responses';
import * as ZodPackageJson from 'zod/package.json';
import { updateZodLanguage } from '../framework-tools/zod';
import { Locale } from '@formatjs/intl-locale'
import { ApiHub } from 'src/api-code/api-hub';
import { Dev } from 'src/api-code/utils/dev';


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
      Dev.log('Payload:', response.data);

      return response.data;
    }

    Dev.log('Invalid payload:', response.data);
  
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
    Dev.log('Payload:', response.data);

    return response.data;
  }

  Dev.log('Invalid payload:', body);

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

export const usePathLanguageCode = (pathLocaleParamKey: string = 'locale', fallbackLanguageCode: string = 'en'): string =>
{
  let localeString = fallbackLanguageCode;
  
  try
  {
    localeString = usePathLocale(pathLocaleParamKey);
  }
  catch (error)
  {
    Dev.logWarning('Error getting path language code:', error);
  }
  
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

export const usePathParam = (name: string, fallbackToQueryParam: boolean = true): string =>
{
  let value = usePathParamAllowEmpty(name);

  if ((!value || value === '') && fallbackToQueryParam)
  {
    Dev.log(`Path parameter ${name} is empty. Falling back to query parameter.`);
    value = useQueryParam(name);
  }

  if (!value || value === '')
  {
    throw new Error(`Path parameter ${name} is required.`);
  }

  Dev.log(`Path parameter ${name}:`, value);

  return value;
}

export const usePathParamAllowEmpty = (name: string): string | undefined =>
{
  const value = usePathParams()[name];

  if (!value || value === '')
  {
    Dev.log(`Path parameter ${name} is empty.`);

    return undefined;
  }

  Dev.log(`Path parameter ${name}:`, value);

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