import { Handler } from 'sst/context';


export type StreamHandlerCallback<T, R> = (event: T) => Promise<R>;



export function StreamHandler<T, R>(cb: StreamHandlerCallback<T, R>)
{
  return Handler<'api', T, R>('api', async (evt, ctx) =>
  {
    let result: R | undefined;

    try
    {
      result = await cb(evt);
    } 
    catch (e)
    {
      throw e;
    }
    return result;
  });
}
