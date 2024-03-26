import { ApiResponseThrowable } from '../throw-utilities/responses';
import { usePathParam } from '../use-utilities/payload-data';


/**
 * Assert that the path ID is the same as the account ID or an alias for the own
 * account ID. Aliases are 'me', 'my', and 'self'.
 * 
 * @param myAccountId The account ID to compare the path ID to.
 * @param pathIdKey The key of the path ID e.g. 'accountId'. Default is 'id'.
 */
export const assertPathIdIsMyAccount = (myAccountId: string, pathIdKey: string = 'id'): void =>
{
  const pathId = usePathParam(pathIdKey);
  const pathIdLower = pathId.toLowerCase();

  if (pathIdLower === 'me' || pathIdLower === 'my' || pathIdLower === 'self')
  {
    return;
  }

  if (pathId !== myAccountId)
  {
    throw new ApiResponseThrowable('FORBIDDEN');
  }
}