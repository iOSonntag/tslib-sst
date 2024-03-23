import { Handler } from 'sst/context';


export type TriggerBase = {
  triggerSource: string;
};
export type TriggerHandlerCallback<T extends TriggerBase> = (event: T) => Promise<T>;



export function TriggerHandler<T extends TriggerBase>(cb: TriggerHandlerCallback<T>)
{
  return Handler<'api', T, T>('api', async (evt, ctx) =>
  {
    let result: T | undefined;

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
