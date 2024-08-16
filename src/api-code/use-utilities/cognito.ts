import { decodeProtectedHeader } from 'jose';
import { JWK, JWS } from 'node-jose';
import { ApiHub } from '../api-hub';
import { useBearerToken } from './payload-data';




export type UseCognitoAuthParams = {
  poolId: string;
  allowedClientIds: string[];
  region?: string;
}

type UseCognitoAuthResultTokenInvalid = {
  type: 'AUTH_INVALID';
};

type UseCognitoAuthResultTokenExpired = {
  type: 'AUTH_TOKEN_EXPIRED';
};

type UseCognitoAuthResultSuccess = {
  type: 'SUCCESS';
  accountId: string;
  accessToken: string;
  claims?: any;
};

export type UseCognitoAuthResult = UseCognitoAuthResultTokenInvalid | UseCognitoAuthResultTokenExpired | UseCognitoAuthResultSuccess;

export const useCognitoAuth = async (params: UseCognitoAuthParams): Promise<UseCognitoAuthResult> =>
{
  const token = useBearerToken();

  if (!token)
  {
    return {
      type: 'AUTH_INVALID'
    };
  }

  const header = decodeProtectedHeader(token);

  const region = params.region ?? ApiHub.config.region;
  const jwks = await fetchJWKS(region, params.poolId);

  const data = jwks['keys'] ?? {};

  const foundKey = data.find((k: any) => k.kid === header.kid);
  
  if (!foundKey)
  {
    console.log(`Could not find a public key for key id (kid) ${header.kid}`);

    return {
      type: 'AUTH_INVALID'
    };
  }

  let claims;
  let current_ts;

  try
  {
    const publicKey = await JWK.asKey(foundKey);
    const verifyResult = await JWS.createVerify(publicKey).verify(token);

    claims = JSON.parse(verifyResult.payload.toString());
    current_ts = Math.floor(Date.now() / 1000);
  }
  catch (e)
  {
    console.log(`Could not verify token: ${e}`);

    return {
      type: 'AUTH_INVALID'
    };
  }

  if (current_ts > claims.exp)
  {
    return {
      type: 'AUTH_TOKEN_EXPIRED'
    };
  }

  for (const fiId of params.allowedClientIds)
  {
    if (fiId === claims.client_id || fiId === claims.aud)
    {
      return {
        type: 'SUCCESS',
        accountId: claims.sub,
        claims: claims,
        accessToken: token
      };
    }
  }

  console.warn(`Token was not issued for this audience`);

  return {
    type: 'AUTH_INVALID'
  };
}


const fetchJWKS = async (region: string, poolId: string): Promise<any> =>
{
  for (let i = 0; i < 5; i++)
  {
    try
    {
      const cognitoInfoUrl = `https://cognito-idp.${region}.amazonaws.com/${poolId}/.well-known/jwks.json`;

      const response = await fetch(cognitoInfoUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok)
      {
        throw new Error('Failed to get Cognito info');
      }

      return await response.json();
    }
    catch (e)
    {
      console.log(`Failed to get JWKS: ${e}`);

      await new Promise((resolve) => setTimeout(resolve, 200 * (i + 1)));
    }
  }

  throw new Error('Cognito failed to get JWKS');
}