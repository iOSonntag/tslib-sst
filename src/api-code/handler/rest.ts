import { ApiHandler } from 'sst/node/api';
import { RestResponse } from '../models';


export type RestHandlerCallback = () => Promise<RestResponse>;

export const createRestHandler = (cb: RestHandlerCallback) =>
{
  return ApiHandler(async (event, context) =>
  {
    const response = await cb();

    return response;
  });
}