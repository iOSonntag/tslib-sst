
import { v4 as uuidv4 } from 'uuid';


/**
 * Generates a new version 4 UUID every time it is called.
 */
export const genUuid = () =>
{
  return uuidv4();
}

/**
 * Generates a delay for the given amount of milliseconds.
 */
export const genDelay = (ms: number): Promise<void> =>
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a new ISO string based timestamp based on the current time. 
 * E.g. "2021-08-01T12:00:00.000Z" 
 */
export const genIsoTimestamp = (fromDate?: Date) =>
{
  return (fromDate ?? new Date()).toISOString();
}
/**
 * Generates a new ISO string based timestamp based on the current time and adds
 * a uuid v4 to it.
 * E.g. "2021-08-01T12:00:00.000Z:123e4567-e89b-12d3-a456-426614174000"
 */
export const genIsoTimestampUnique = (fromDate?: Date) =>
{
  return `${genIsoTimestamp()}:${genUuid()}`
}

/**
 * Generates a new DynamoDB TTL value based on the current time and the given expiration time.
 * @param expireInSeconds The number of seconds after which the item should expire.
 */
export const genDynamoDbTtl = (expireInSeconds: number) =>
{
  return Math.floor(Date.now() / 1000) + expireInSeconds; 
}

/**
 * Generates a new DynamoDB TTL value based on given expiration date.
 */
export const genDynamoDbTtlFromDate = (expireDate: Date) =>
{
  return Math.floor(expireDate.getTime() / 1000);
}

/**
 * Generates a date in iso timestamp format from a DynamoDB TTL value.
 */
export const genDateFromDynamoDbTtl = (ttl: number) =>
{
  return ttl === -1 ? undefined : genIsoTimestamp(new Date(ttl * 1000))
}

/**
 * Generates a random integer between 0 and the given maximum value (excluded!)
 */
export const genRandomInt = (max: number) =>
{
  const randomInt = Math.floor(Math.random() * max);

  if (randomInt >= max)
  {
    return max - 1;
  }

  return randomInt;
}
