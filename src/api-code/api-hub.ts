import { HandlerTypes } from 'sst/context/handler';
import { ApiHandler } from 'sst/node/api';
import { RestHandlerCallback, createRestHandler } from './handler/rest';


export type ApiHubConfig = {
  env: string;
  region: string;
};

export type HandlerType = 'REST';

export type HandlerCallback<T> = T extends 'REST' ? RestHandlerCallback : never;


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

  public static handler<T extends HandlerType>(type: T, cb: HandlerCallback<T>) 
  {
    switch (type)
    {
      case 'REST':
        return createRestHandler(cb);
      default:
        throw new Error(`Handler type ${type} is not supported.`);
    }
  }
}