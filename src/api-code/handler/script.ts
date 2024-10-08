import { Handler } from '../sst-v2/handler';


export type ScriptHandlerCallback = (event: any) => Promise<void>;

export function ScriptHandler(cb: ScriptHandlerCallback)
{
  return Handler<'api', any, void>('api', async (evt, ctx) =>
  {
    try
    {
      await cb(evt);
    } 
    catch (e)
    {
      throw e;
    }
  });
}
