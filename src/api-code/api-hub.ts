import { ApiHandler, Response } from 'sst/node/api';
import { ApiIssue, RestResponse } from './models';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { TriggerBase, TriggerHandler, TriggerHandlerCallback } from './handler/trigger';
import { ApiResponse, CommonApiResponseCode, CommonApiResponses } from './responses/rest-responses';
import { ApiResponseThrowable } from './throw-utilities/responses';


export type ApiHubConfig = {
  env: string;
  region: string;
  transformers: {
    createApiGatewayResponse: (response: ApiResponse) => APIGatewayProxyStructuredResultV2;
    createApiResponseFromUnkownError: (error: unknown) => ApiResponse;
  },
};


export type RestHandlerCallback = () => Promise<ApiResponse | CommonApiResponseCode>;


export abstract class ApiHub {

  private static _config?: ApiHubConfig;

  /**
   * Initialize the ApiHub framework. Should only be called once. The best
   * place to call this in th beginning of the main entry point file of the
   * application.
   */
  public static init(config: ApiHubConfig): void
  {
    ApiHub._config = config;
  }

  public static get config(): ApiHubConfig
  {
    if (!ApiHub._config)
    {
      throw new Error('ApiHub framework has not been initialized. Use ApiHub.init() to initialize the ApiHub framework.');
    }

    return ApiHub._config;
  }

  public static handlerREST(cb: RestHandlerCallback)
  {
    return ApiHandler(async (event, context) =>
    {
      try
      {
        let response = await cb();

        if (typeof response === 'string')
        {
          response = CommonApiResponses[response as CommonApiResponseCode];

          if (!response)
          {
            throw new ApiIssue({
              message: 'The response code used for a response shortcut is unknown. This is a critical issue and should never happen.',
              // TODO: improve once exception system is in place
              error: new Error('Unknown response code'),
            });
          }
        }

        return ApiHub.config.transformers.createApiGatewayResponse(response);
      }
      catch (e)
      {
        if (e instanceof ApiResponseThrowable)
        {
          return ApiHub.config.transformers.createApiGatewayResponse(e.result);
        }

        if (e instanceof Response)
        {
          // rethrow and let SST handle it
          throw e;
        }

        return ApiHub.config.transformers.createApiGatewayResponse(ApiHub.config.transformers.createApiResponseFromUnkownError(e));
      }
  
    });
  }

  public static handlerTRIGGER<T extends TriggerBase>(cb: TriggerHandlerCallback<T>)
  {
    return TriggerHandler<T>(async (event) =>
    {
      const response = await cb(event);
  
      return response;
    });
  }
}


