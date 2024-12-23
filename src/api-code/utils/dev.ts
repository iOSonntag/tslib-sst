import util from 'util';
import { Logger } from '@aws-sdk/types';
import { ApiHub } from 'src/api-code/api-hub';

export * as Dev from './dev';



type LogType = {
  date: Date;
  type: 'debug' | 'info' | 'warn' | 'error';
  message: string;
};

let logs: LogType[] = [];

export const awsLogger: Logger = {
  debug: (...args) => logDebug(...args),
  info: (...args) => log(...args),
  warn: (...args) => logWarning(...args),
  error: (...args) => logSilentError(...args)
};


export const clearLogs = () =>
{
  logs = [];
}


export const log = (...args: any[]) =>
{
  if (ApiHub.alwaysEmitLogs)
  {
    console.log(createMessageFromArgs(args));
    return;
  }

  logs.push({
    date: new Date(),
    type: 'info',
    message: createMessageFromArgs(args),
  });
}

export const logWarning = (...args: any[]) =>
{
  if (ApiHub.alwaysEmitLogs)
  {
    console.warn(createMessageFromArgs(args));
    return;
  }

  logs.push({
    date: new Date(),
    type: 'warn',
    message: createMessageFromArgs(args),
  });
}

export const logDebug = (...args: any[]) =>
{
  if (ApiHub.alwaysEmitLogs)
  {
    console.debug(createMessageFromArgs(args));
    return;
  }

  logs.push({
    date: new Date(),
    type: 'debug',
    message: createMessageFromArgs(args),
  });
}

export const logSilentError = (...args: any[]) =>
{
  if (ApiHub.alwaysEmitLogs)
  {
    console.error(createMessageFromArgs(args));
    return;
  }

  logs.push({
    date: new Date(),
    type: 'error',
    message: createMessageFromArgs(args),
  });
}

export const logIssue = (...args: any[]) =>
{
  try
  {
    flush(new Error(createMessageFromArgs(args)));
  }
  catch (error)
  {
    flush(new Error('Failed to flush issue'));
  }
}

const createMessageFromArgs = (args: any[]) =>
{
  const rawArgs = args.map((arg) => typeof arg !== 'object' ? arg : util.inspect(arg, { depth: 20 }));

  return util.format.apply(null, rawArgs);
}

export const flushLogs = () =>
{
  for (const log of logs)
  {
    if (log.type === 'info')
    {
      console.log(log.date, log.message);
    }
    else if (log.type === 'warn')
    {
      console.warn(log.date, log.message);
    }
    else if (log.type === 'debug')
    {
      console.debug(log.date, log.message);
    }
    else if (log.type === 'error')
    {
      console.error(log.date, log.message);
    }
    else
    {
      console.error('Unknown log type:', log);
    }
  }
  logs = [];
}

const flush = (error: unknown) =>
{
  flushLogs();
  console.error(error);
}