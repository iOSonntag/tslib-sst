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

type ConcurrentRetryScopeOptions = {
  onError: 'THROW_FIRST' | 'LOG_ISSUES' | 'IGNORE';
  tasks: (() => Promise<void>)[];
};

export const concurrentRetryScope = async (options: ConcurrentRetryScopeOptions): Promise<void> =>
{
  const promises = options.tasks.map(task => retryScope(task));

  const results = await Promise.allSettled(promises);

  const failed = results.filter(result => result.status === 'rejected');

  if (failed.length > 0)
  {
    if (options.onError === 'THROW_FIRST')
    {
      throw new Error(failed[0].reason);
    }
    else if (options.onError === 'LOG_ISSUES')
    {
      failed.forEach(result => Dev.logIssue(result.reason));
    }
    else
    {
      Dev.log('Failed tasks (not throwing / ignoring them):');
      failed.forEach(result => Dev.log(result.reason));
    }
  }
}

export const retryScopeLogIssueNotThrow = async (fn: () => Promise<void>): Promise<void> =>
{
  try
  {
    await retryScope(fn);
  }
  catch (error: any)
  {
    Dev.logIssue(error);
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