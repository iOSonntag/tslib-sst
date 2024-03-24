import { ApiResponse } from '../responses/rest-responses';


export class ApiResponseThrowable {
  constructor(public readonly result: ApiResponse) {}
}

/**
 * You can throw successful responses or error responses. This causes the
 * execution to stop and the response to be returned to the client.
 */
export const throwResponse = (response: ApiResponse): never =>
{
  throw new ApiResponseThrowable(response);
}