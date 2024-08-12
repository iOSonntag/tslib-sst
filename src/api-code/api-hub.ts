import { ApiHandler, Response } from 'sst/node/api';
import { ApiIssue, RestResponse } from './models';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { TriggerBase, TriggerHandler, TriggerHandlerCallback } from './handler/trigger';
import { ScriptHandler, ScriptHandlerCallback } from './handler/script';
import { ApiResponse, CommonApiResponseCode, CommonApiResponses } from './responses/api-responses';
import { ApiResponseThrowable } from './throw-utilities/responses';
import { Handler } from 'sst/context';
import { StreamHandler, StreamHandlerCallback } from './handler/stream';


export type ApiHubConfig = {
  env: string;
  region: string;
  transformers: {
    createApiGatewayResponse: (response: ApiResponse) => APIGatewayProxyStructuredResultV2;
    createApiResponseFromUnkownError: (error: unknown) => ApiResponse;
  },
  events: {
    /**
     * Use this event to monitor the issue. 
     * 
     * Note: You cannot throw a diffwerent exception here, the call to this
     * function is wrapped in a try catch and the inner error of the ApiIssue
     * will be used for generating the response, regardless of what you do here.
     */
    onApiIssue: (issue: ApiIssue) => Promise<void>;
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
            throw new ApiIssue('The response code used for a response shortcut is unknown. This is a critical issue and should never happen.');
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

        if (e instanceof ApiIssue)
        {
          console.error('An API issue occurred:', e);
          await ApiHub.safelyHandleApiIsueEvent(e);

          return ApiHub.config.transformers.createApiGatewayResponse(ApiHub.config.transformers.createApiResponseFromUnkownError(e.error));
        }

        if (e instanceof Response)
        {
          // rethrow and let SST handle it
          throw e;
        }

        console.error('An unknown error occurred:', e);

        return ApiHub.config.transformers.createApiGatewayResponse(ApiHub.config.transformers.createApiResponseFromUnkownError(e));
      }
  
    });
  }

  public static handlerTRIGGER<T extends TriggerBase>(cb: TriggerHandlerCallback<T>)
  {
    return TriggerHandler<T>(async (event) =>
    {
      try
      {
        const response = await cb(event);

        return response;
      }
      catch (e)
      {
        if (e instanceof ApiIssue)
        {
          await ApiHub.safelyHandleApiIsueEvent(e);

          throw e.error;
        }

        throw e;
      }
  
    });
  }

  public static handlerSCRIPT(cb: ScriptHandlerCallback)
  {
    return ScriptHandler(async (event) =>
    {
      try
      {
        const response = await cb(event);

        return response;
      }
      catch (e)
      {
        if (e instanceof ApiIssue)
        {
          await ApiHub.safelyHandleApiIsueEvent(e);

          throw e.error;
        }
        
        throw e;
      }
    });
  }


  public static handlerSTREAM<T, R>(cb: StreamHandlerCallback<T, R>)
  {
    return StreamHandler<T, R>(async (event) =>
    {
      try
      {
        const response = await cb(event);

        return response;
      }
      catch (e)
      {
        if (e instanceof ApiIssue)
        {
          await ApiHub.safelyHandleApiIsueEvent(e);

          throw e.error;
        }

        throw e;
      }
  
    });
  }




  private static async safelyHandleApiIsueEvent(issue: ApiIssue): Promise<void>
  {
    try
    {
      await ApiHub.config.events.onApiIssue(issue);
    }
    catch (e)
    {
      console.error('An error occurred while trying to handle an API issue:', e);
    }
  }
}


