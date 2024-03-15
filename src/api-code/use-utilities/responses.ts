import { JsonResponse } from '../models';



export const useResponseNotImplemented = (): JsonResponse =>
{
  return {
    statusCode: 501,
    body: 'Not Implemented',
  };
}