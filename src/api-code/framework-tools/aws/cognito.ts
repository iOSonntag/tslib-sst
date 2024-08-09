import { AdminInitiateAuthCommand, AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand, AliasExistsException, CognitoIdentityProviderClient, InitiateAuthCommand, NotAuthorizedException, RespondToAuthChallengeCommand, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
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

    client.destroy();
  
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
    client.destroy();

    if (error instanceof NotAuthorizedException)
    {
      return {
        success: false
      };
    }

    console.error('Failed to authenticate', error);


    throw error;
  }
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

    client.destroy();
  }
  catch (error)
  {

    client.destroy();

    if (error instanceof AliasExistsException)
    {
      throw throwResponse('RESOURCE_ALREADY_EXISTS');
    }
    
    console.error('Failed to update email', error);

    throw error;
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

    client.destroy();
  }
  catch (error)
  {
    client.destroy();

    console.error('Failed to update password', error);

    throw error;
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
  });

  try
  {
    const deleteCommand = new AdminDeleteUserCommand({
      UserPoolId: params.userPoolId,
      Username: params.username,
    });

    await client.send(deleteCommand);

    client.destroy();
  }
  catch (error)
  {
    client.destroy();

    console.error('Failed to delete user', error);

    throw error;
  }
}