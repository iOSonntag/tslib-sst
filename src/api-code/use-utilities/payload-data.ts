import { useHeader, usePathParams } from 'sst/node/api'


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