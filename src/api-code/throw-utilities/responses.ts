import { ApiResponse, CommonApiResponseCode, CommonApiResponses } from '../responses/api-responses';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { ElectroError } from 'electrodb';


export class ApiResponseThrowable {

  public readonly result: ApiResponse;

  constructor(result: ApiResponse | CommonApiResponseCode)
  {
    this.result = typeof result === 'string' ? CommonApiResponses[result as CommonApiResponseCode] : result;

    if (!this.result)
    {
      throw new Error(`Invalid ApiResponse code: ${result}`);
    }
  }
}

/**
 * You can throw successful responses or error responses. This causes the
 * execution to stop and the response to be returned to the client.
 */
export const throwResponse = (response: ApiResponse | CommonApiResponseCode): never =>
{
  throw new ApiResponseThrowable(response);
}

/**
 * In case of a DynamoDB conditional check failed error, the given response will
 * be thrown, otherwise the error will be rethrown.
 */
export const throwResponseIfDynamoDBConditionalCheckFailed = (e: any, response: ApiResponse | CommonApiResponseCode): never =>
{
  if (isDynamoDBConditionalCheckFailedException(e))
  {
    throw new ApiResponseThrowable(response);
  }

  throw e;
}

export const isDynamoDBConditionalCheckFailedException = (e: any): boolean =>
{
  if (e instanceof ConditionalCheckFailedException)
  {
    return true;
  }

  if (e instanceof ElectroError && e.cause instanceof ConditionalCheckFailedException)
  {
    return true;
  }

  if (e.code === 'ConditionalCheckFailedException')
  {
    return true;
  }

  return false;
}