import { ApiHandler } from 'sst/node/api';
import { RestResponse } from './models';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { TriggerBase, TriggerHandler, TriggerHandlerCallback } from './handler/trigger';


export type ApiHubConfig = {
  env: string;
  region: string;
};




export type RestHandlerCallback = () => Promise<RestResponse>;


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
      const response = await cb();
  
      return response;
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


