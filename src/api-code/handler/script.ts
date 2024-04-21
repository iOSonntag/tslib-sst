import { Handler } from 'sst/context';


export type ScriptHandlerCallback = (event: any) => Promise<void>;

// TODO: test this, this is so not tested

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
