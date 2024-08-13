import { CreatePlatformEndpointCommand, CreatePlatformEndpointCommandInput, DeleteEndpointCommand, DeleteEndpointCommandInput, PublishCommand, PublishCommandInput, SNSClient, SetEndpointAttributesCommand, SetEndpointAttributesCommandInput, SetTopicAttributesCommandInput } from '@aws-sdk/client-sns';


export * as SnsService from './sns';

export type PublishToTopicParams = {
  region: string;
  topicArn: string;
  subject?: string;
  message: string;
};

export const publishToTopic = async (params: PublishToTopicParams) =>
{
  const client = new SNSClient({ region: params.region });

  const paramsSns: PublishCommandInput = {
    Message: params.message,
    Subject: params.subject,
    TopicArn: params.topicArn,
  };

  try
  {
    await client.send(new PublishCommand(paramsSns));
  }
  finally
  {
    client.destroy();
  }
}


export type PublishToTargetParams = {
  targetArn: string;
  message: string;
  region: string;
};

export const publishToTarget = async (params: PublishToTargetParams) =>
{
  const client = new SNSClient({ region: params.region });

  const paramsSns: PublishCommandInput = {
    Message: params.message,
    MessageStructure: 'json',
    TargetArn: params.targetArn,
  };

  try
  {
    await client.send(new PublishCommand(paramsSns));
  }
  finally
  {
    client.destroy();
  }
}




export type SendPushNotificationParams = {
  endpointArn: string;
  region: string;
  titleKey?: string;
  messageKey: string;
  messageArgs?: string[];
  badgeCount?: number;
  data?: Record<string, any>;
};

export const sendPushNotification = async (params: SendPushNotificationParams) =>
{
  const snsClient = new SNSClient({ region: params.region });

  const iosNotification: any = {
    aps: {
      alert: {
        'loc-key': params.messageKey
      },
      sound: 'default'
    }
  };

  const androidNotification: any = {
    notification: {
      body_loc_key: params.messageKey,
      sound: 'default'
    }
  };

  if (params.titleKey)
  {
    iosNotification.aps.alert['title-loc-key'] = params.titleKey;
    androidNotification.notification.title_loc_key = params.titleKey
  }

  if (params.messageArgs)
  {
    iosNotification.aps.alert['loc-args'] = params.messageArgs;
    androidNotification.notification.body_loc_args = params.messageArgs;
  }

  if (params.badgeCount)
  {
    iosNotification.aps.badge = params.badgeCount;
  }

  if (params.data)
  {
    iosNotification.data = params.data;
    androidNotification.data = params.data;
  }

  const message = {
    APNS: JSON.stringify(iosNotification),
    APNS_SANDBOX: JSON.stringify(iosNotification),
    GCM: JSON.stringify(androidNotification),
  };

  const paramsSns: PublishCommandInput = {
    Message: JSON.stringify(message),
    MessageStructure: 'json',
    TargetArn: params.endpointArn,
  };

  try
  {
    await snsClient.send(new PublishCommand(paramsSns));
  
    snsClient.destroy();
  }
  catch (e)
  {
    console.error('sendPushNotification error', e);

    snsClient.destroy();

    throw e;
  }
}




export type CreatePushNotificationsDeviceParams = {
  platformApplicationArn: string;
  token: string;
  region: string;
};

export const createPushNotificationsDevice = async (params: CreatePushNotificationsDeviceParams) =>
{
  const snsClient = new SNSClient({ region: params.region });

  const paramsSns: CreatePlatformEndpointCommandInput = {
    PlatformApplicationArn: params.platformApplicationArn,
    Token: params.token,
  };

  try
  {
    const response = await snsClient.send(new CreatePlatformEndpointCommand(paramsSns));

    const endpointArn = response.EndpointArn;
  
    if (!endpointArn)
    {
      throw new Error('EndpointArn is not defined');
    }
    
    snsClient.destroy();

    return endpointArn;
  }
  catch (e)
  {
    console.error('createPushNotificationsDevice error', e);

    snsClient.destroy();

    throw e;
  }

}

export type UpdatePushNotificationsDeviceParams = {
  endpointArn: string;
  token: string;
  region: string;
};

/**
 * Note: If the device was first registered as an iOS device and then as an
 * Android device, the device must be deleted and re-created - do not use this
 * method then. Same goes for the other way around, or any other change in the
 * device. This method is only for updating the token.
 */
export const updatePushNotificationsDevice = async (params: UpdatePushNotificationsDeviceParams) =>
{
  const snsClient = new SNSClient({ region: params.region });

  const paramsSns: SetEndpointAttributesCommandInput = {
    EndpointArn: params.endpointArn,
    Attributes: {
      Token: params.token,
      Enabled: 'true',
    },
  };

  try
  {
    await snsClient.send(new SetEndpointAttributesCommand(paramsSns));
  
    snsClient.destroy();
  }
  catch (e)
  {
    console.error('updatePushNotificationsDevice error', e);

    snsClient.destroy();

    throw e;
  }
}

export type DeletePushNotificationsDeviceParams = {
  endpointArn: string;
  region: string;
};

export const deletePushNotificationsDevice = async (params: DeletePushNotificationsDeviceParams) =>
{
  const snsClient = new SNSClient({ region: params.region });

  const paramsSns: DeleteEndpointCommandInput = {
    EndpointArn: params.endpointArn,
  };

  try
  {
    await snsClient.send(new DeleteEndpointCommand(paramsSns));
  
    snsClient.destroy();
  }
  catch (e)
  {
    console.error('deletePushNotificationsDevice error', e);

    snsClient.destroy();

    throw e;
  }
}