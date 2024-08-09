import { useHeader } from 'sst/node/api';
import { throwResponse } from '../throw-utilities/responses';


export type ClientVersion = `${number}.${number}.${number}`;

export const assertMinClientVersion = (minClientVersion: ClientVersion) =>
{
  const minClientVersionParts = minClientVersion.split('.').map(Number);
  const clientVersion = useHeader('X-Client-Version') ?? useHeader('x-client-version');

  if (!clientVersion)
  {
    console.log('Client version is missing');
    throw throwResponse('CLIENT_VERSION_INVALID');
  }

  let clientVersionParts: number[];

  try
  {
    clientVersionParts = clientVersion.split('.').map(Number);
  }
  catch (e)
  {
    console.log(`Failed to parse client version '${clientVersion}'`, e);
    throw throwResponse('CLIENT_VERSION_INVALID');
  }


  if (clientVersionParts.length !== 3)
  {
    console.log(`Client version is not in the format x.y.z '${clientVersion}'`);
    throw throwResponse('CLIENT_VERSION_INVALID');
  }

  if (clientVersionParts[0] < minClientVersionParts[0])
  {
    throw throwResponse('CLIENT_VERSION_DEPRECATED');
  }

  if (clientVersionParts[0] === minClientVersionParts[0] && clientVersionParts[1] < minClientVersionParts[1])
  {
    throw throwResponse('CLIENT_VERSION_DEPRECATED');
  }

  if (clientVersionParts[0] === minClientVersionParts[0] && clientVersionParts[1] === minClientVersionParts[1] && clientVersionParts[2] < minClientVersionParts[2])
  {
    throw throwResponse('CLIENT_VERSION_DEPRECATED');
  }
}