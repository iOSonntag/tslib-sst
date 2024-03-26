import { ApiResponse, CommonApiResponseCode, CommonApiResponses } from '../responses/api-responses';


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