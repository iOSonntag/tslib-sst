import util from 'util';
import { Logger } from '@aws-sdk/types';

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
  logs.push({
    date: new Date(),
    type: 'info',
    message: util.format.apply(null, [...args]),
  });
}

export const logWarning = (...args: any[]) =>
{
  logs.push({
    date: new Date(),
    type: 'warn',
    message: util.format.apply(null, [...args]),
  });
}

export const logDebug = (...args: any[]) =>
{
  logs.push({
    date: new Date(),
    type: 'debug',
    message: util.format.apply(null, [...args]),
  });
}

export const logSilentError = (...args: any[]) =>
{
  logs.push({
    date: new Date(),
    type: 'error',
    message: util.format.apply(null, [...args]),
  });
}



export const logIssue = (...args: any[]) =>
{
  try
  {
    flush(new Error( util.format.apply(null, [...args])));
  }
  catch (error)
  {
    flush(new Error('Failed to flush issue'));
  }
}



const flush = (error: unknown) =>
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

  console.error(error);

  logs = [];
}