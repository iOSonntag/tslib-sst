


export type JsonResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
};


export type RestResponse = JsonResponse;



export type ApiIssueParams = {
  message: string;
  error: Error;
};
/**
 * When throwing this error, the error will be logged special and an
 * notification will be sent to the developers. Afterwards the given error will
 * be rethrown.
 */
export class ApiIssue extends Error
{
  public readonly error: Error;

  constructor(params: ApiIssueParams)
  {
    super(params.message);
    this.error = params.error;
  }
}