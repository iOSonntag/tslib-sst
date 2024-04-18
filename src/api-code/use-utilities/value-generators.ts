
import { v4 as uuidv4 } from 'uuid';


/**
 * Generates a new version 4 UUID every time it is called.
 */
export const genUuid = () =>
{
  return uuidv4();
}

/**
 * Generates a new DynamoDB TTL value based on the current time and the given expiration time.
 * @param expireInSeconds The number of seconds after which the item should expire.
 */
export const genDynamoDbTtl = (expireInSeconds: number) =>
{
  return Math.floor(Date.now() / 1000) + expireInSeconds; 
}