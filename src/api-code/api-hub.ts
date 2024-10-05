import { ApiHandler, Response } from './sst-v2/api';
import { ApiIssue, RestResponse } from './models';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { TriggerBase, TriggerHandler, TriggerHandlerCallback } from './handler/trigger';
import { ScriptHandler, ScriptHandlerCallback } from './handler/script';
import { ApiErrorResBase, ApiResponse, CommonApiResponseCode, CommonApiResponses } from './responses/api-responses';
import { ApiResponseThrowable } from './throw-utilities/responses';
import { StreamHandler, StreamHandlerCallback } from './handler/stream';
import { SSTConsole } from './utils/sst-console';


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
    errorResponseShouldLogIssue: (response: ApiErrorResBase) => boolean;
  },
};


export type RestHandlerCallback = () => Promise<ApiResponse | CommonApiResponseCode>;

export type ApiHubFunctionConfig = {
  errorResponseShouldLogIssue?: (response: ApiErrorResBase) => boolean;
};

export abstract class ApiHub {

  private static _config?: ApiHubConfig;
  private static _functionConfig?: ApiHubFunctionConfig;

  /**
   * Initialize the ApiHub framework. Should only be called once. The best
   * place to call this in th beginning of the main entry point file of the
   * application.
   */
  public static init(config: ApiHubConfig, functionConfig: ApiHubFunctionConfig = {}): void
  {
    ApiHub._config = config;
    ApiHub._functionConfig = functionConfig;
  }

  public static get config(): ApiHubConfig
  {
    if (!ApiHub._config)
    {
      throw new Error('ApiHub framework has not been initialized. Use ApiHub.init() to initialize the ApiHub framework.');
    }

    return ApiHub._config;
  }

  public static get functionConfig(): ApiHubFunctionConfig
  {
    if (!ApiHub._functionConfig)
    {
      throw new Error('ApiHub framework has not been initialized. Use ApiHub.init() to initialize the ApiHub framework.');
    }

    return ApiHub._functionConfig;
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

        return ApiHub.createAndLogApiGatewayResponse(response);
      }
      catch (e)
      {
        if (e instanceof ApiResponseThrowable)
        {
          return ApiHub.createAndLogApiGatewayResponse(e.result);
        }

        if (e instanceof ApiIssue)
        {
          SSTConsole.logIssue('An API issue occurred:', e);
          await ApiHub.safelyHandleApiIsueEvent(e);

          return ApiHub.createAndLogApiGatewayResponse(ApiHub.config.transformers.createApiResponseFromUnkownError(e.error));
        }

        if (e instanceof Response)
        {
          // rethrow and let SST handle it
          throw e;
        }

        SSTConsole.logIssue('An unknown error occurred:', e);

        return ApiHub.createAndLogApiGatewayResponse(ApiHub.config.transformers.createApiResponseFromUnkownError(e));
      }
  
    });
  }

  private static createAndLogApiGatewayResponse(response: ApiResponse): APIGatewayProxyStructuredResultV2
  {
    const gatewayResponse = ApiHub.config.transformers.createApiGatewayResponse(response);

    if (!response.success)
    {
      try
      {
        const shouldLogGlobal = ApiHub.config.events.errorResponseShouldLogIssue(response);

        if (shouldLogGlobal)
        {
          const shouldLogFunction = !ApiHub.functionConfig.errorResponseShouldLogIssue ? true : ApiHub.functionConfig.errorResponseShouldLogIssue(response);

          if (shouldLogFunction)
          {
            SSTConsole.logIssue('API ERROR', response);
          }
        }
      }
      catch (e)
      {
        console.log('Orginal response:', response);
        SSTConsole.logIssue('An error occurred while trying to handle an API ERROR and checking for its issue logging status:', e);
      }
    }

    return gatewayResponse;
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
      SSTConsole.logIssue('An error occurred while trying to handle an API issue:', e);
    }
  }
}


