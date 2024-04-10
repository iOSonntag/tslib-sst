


export type JsonResponse = {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
};


export type RestResponse = JsonResponse;



export type ApiIssueParams = {
  message: string;
  error?: any;
};

const API_ISSUE_MESSAGE_POSTFIX = ' This is an api issue that should never happen.';

/**
 * When throwing this error, the error will be logged special and an
 * notification will be sent to the developers. Afterwards the given error will
 * be rethrown.
 */
export class ApiIssue extends Error
{
  public readonly error: any;

  constructor(params: ApiIssueParams | string)
  {
    super(typeof params === 'string' ? params + API_ISSUE_MESSAGE_POSTFIX : params.message + API_ISSUE_MESSAGE_POSTFIX);
    this.error = typeof params === 'string' ? new Error(params + API_ISSUE_MESSAGE_POSTFIX) : params.error ?? new Error(params.message + API_ISSUE_MESSAGE_POSTFIX);
  }
}
