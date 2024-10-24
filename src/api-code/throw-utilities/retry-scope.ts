import { Dev } from 'src/api-code/utils/dev';




export class NoRetryError extends Error
{
  public code = 'NO_RETRY_WRAPPER';
  public innerError: Error;

  constructor(innerError: Error)
  {
    super(innerError.message);
    this.innerError = innerError;
  }
}

export const retryScope = async <T>(fn: () => Promise<T>, attempt: number = 1): Promise<T> =>
{
  try
  {
    return await fn();
  }
  catch (error: any)
  {
    if (error instanceof NoRetryError)
    {
      throw error.innerError;
    }

    Dev.logIssue(error);

    if (attempt <= 5)
    {
      Dev.log(`Retrying ${attempt + 1}...`);
      
      const random = Math.random();
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt * attempt + random * 1000));
      return await retryScope(fn, attempt + 1);
    }
    

    throw error;
  }
}