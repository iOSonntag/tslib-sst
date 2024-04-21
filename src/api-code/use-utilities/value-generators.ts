
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
 * Generates a new DynamoDB TTL value based on the current time and the given expiration time.
 * @param expireInSeconds The number of seconds after which the item should expire.
 */
export const genDynamoDbTtl = (expireInSeconds: number) =>
{
  return Math.floor(Date.now() / 1000) + expireInSeconds; 
}

/**
 * Generates a random integer between 0 and the given maximum value (excluded!)
 */
export const genRandomInt = (max: number) =>
{
  return Math.floor(Math.random() * max);
}
