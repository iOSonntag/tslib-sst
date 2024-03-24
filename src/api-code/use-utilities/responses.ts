import { JsonResponse } from '../models';
import { ApiResponse } from '../responses/rest-responses';



export const useResponseNotImplemented = (): ApiResponse =>
{
  return {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'This endpoint is not implemented yet.',
    },
  };
}