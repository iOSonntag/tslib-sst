import { AdminDeleteUserCommand, AdminGetUserCommand, AdminInitiateAuthCommand, AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand, AliasExistsException, AttributeType, CognitoIdentityProviderClient, NotAuthorizedException } from '@aws-sdk/client-cognito-identity-provider';
import { Dev } from 'src/api-code/utils/dev';
import { throwResponse } from '../../throw-utilities/responses';

export * as CognitoService from './cognito';


export type AuthenticateParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
  password: string;
};

type AuthenticateResult = {
  success: boolean;
  accessToken?: string;
}

export const authenticate = async (params: AuthenticateParams): Promise<AuthenticateResult> =>
{
  const client = new CognitoIdentityProviderClient({ 
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const initiateAuthCommand = new AdminInitiateAuthCommand({
      AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
      UserPoolId: params.userPoolId,
      ClientId: params.clientId,
      AuthParameters: {
        USERNAME: params.username,
        PASSWORD: params.password
      }
    });

    const authResponse = await client.send(initiateAuthCommand);
  
    if (!authResponse.AuthenticationResult)
    {
      return {
        success: false
      };
    }

    const accessToken = authResponse.AuthenticationResult.AccessToken;

    if (!accessToken)
    {
      return {
        success: false
      };
    }

    return {
      success: true,
      accessToken: accessToken
    };
  }
  catch (error)
  {
    if (error instanceof NotAuthorizedException)
    {
      return {
        success: false
      };
    }

    Dev.logIssue('Failed to authenticate', error);


    throw error;
  }
  finally
  {
    client.destroy();
  }
}


export type UpdateUserAttributeParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
  attributeName: string;
  attributeValue: string;
};

export const updateUserAttribute = async (params: UpdateUserAttributeParams): Promise<void> =>
{
  const client = new CognitoIdentityProviderClient({ 
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: params.userPoolId,
      Username: params.username,
      UserAttributes: [
        {
          Name: params.attributeName,
          Value: params.attributeValue
        }
      ]
    });

    await client.send(updateCommand);
  }
  catch (error)
  {
    Dev.logIssue('Failed to update attribute', error);

    throw error;
  }
  finally
  {
    client.destroy();
  }
}



export type GetUserAttributesParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
};

export const getUserAttributes = async (params: GetUserAttributesParams): Promise<AttributeType[]> =>
{
  const client = new CognitoIdentityProviderClient({ 
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const getCommand = new AdminGetUserCommand({
      UserPoolId: params.userPoolId,
      Username: params.username
    });

    const response = await client.send(getCommand);

    if (!response.UserAttributes)
    {
      Dev.logIssue(`No cognito attributes found for user ${params.username}`);
      return [];
    }

    return response.UserAttributes;
  }
  catch (error)
  {
    Dev.logIssue('Failed to get attribute', error);

    throw error;
  }
  finally
  {
    client.destroy();
  }
}


export type GetUserAttributeParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
  attributeName: string;
};

export const getUserAttribute = async (params: GetUserAttributeParams): Promise<string | undefined> =>
{
  const attributes = await getUserAttributes(params);

  const attribute = attributes.find(a => a.Name === params.attributeName);

  if (!attribute)
  {
    return undefined;
  }

  return attribute.Value;
}





export type UpdateUserEmailParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
  newEmail: string;
  emailIsVerified: boolean;
};

export const updateUserEmail = async (params: UpdateUserEmailParams): Promise<void> =>
{
  if (!params.emailIsVerified)
  {
    throw new Error('Unimplemented');
  }

  const client = new CognitoIdentityProviderClient({ 
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: params.userPoolId,
      Username: params.username,
      UserAttributes: [
        {
          Name: 'email',
          Value: params.newEmail
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ]
    });

    await client.send(updateCommand);
  }
  catch (error)
  {
    if (error instanceof AliasExistsException)
    {
      throw throwResponse('RESOURCE_ALREADY_EXISTS');
    }
    
    Dev.logIssue('Failed to update email', error);

    throw error;
  }
  finally 
  {
    client.destroy();
  }
}

export type UpdatePasswordParams = {
  userPoolId: string;
  clientId: string;
  region: string;
  username: string;
  password: string;
};

export const updatePassword = async (params: UpdatePasswordParams): Promise<void> =>
{
  const client = new CognitoIdentityProviderClient({ 
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const updateCommand = new AdminSetUserPasswordCommand({
      UserPoolId: params.userPoolId,
      Username: params.username,
      Password: params.password,
      Permanent: true
    });

    await client.send(updateCommand);
  }
  catch (error)
  {
    Dev.logIssue('Failed to update password', error);

    throw error;
  }
  finally
  {
    client.destroy();
  }
}


export type DeleteUserParams = {
  userPoolId: string;
  username: string;
  region: string;
};

export const deleteUser = async (params: DeleteUserParams): Promise<void> =>
{
  const client = new CognitoIdentityProviderClient({
    region: params.region,
    logger: Dev.awsLogger
  });

  try
  {
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: params.userPoolId,
      Username: params.username,
    });

    await client.send(deleteCommand);
  }
  catch (error)
  {
    Dev.logIssue('Failed to delete user', error);

    throw error;
  }
  finally
  {
    client.destroy();
  }
}