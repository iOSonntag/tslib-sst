
import { v4 as uuidv4 } from 'uuid';


/**
 * Generates a new version 4 UUID every time it is called.
 */
export const useUuid = () =>
{
  return uuidv4();
}