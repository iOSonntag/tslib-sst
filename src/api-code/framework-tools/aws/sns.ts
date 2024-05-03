import { PublishCommand, PublishCommandInput, SNSClient } from '@aws-sdk/client-sns';


export * as SnsService from './sns';

const snsClient = new SNSClient();

export type PublishToTopicParams = {
  topicArn: string;
  subject?: string;
  message: string;
};
export const publishToTopic = async (params: PublishToTopicParams) =>
{
  const paramsSns: PublishCommandInput = {
    Message: params.message,
    Subject: params.subject,
    TopicArn: params.topicArn,
  };

  await snsClient.send(new PublishCommand(paramsSns));
}