



type ApiResBase = {
  success: true;
};

export type ApiResSimple = ApiResBase & {};
export type ApiResData<T> = ApiResBase & {
  data: T;
};

export type ApiErrorResBase = {
  success: false;
  error: {
    code: string;
    message?: string;
    details?: any;
  };
};

export type ApiErrorRes = ApiErrorResBase & {};

export type ApiResponse = ApiResSimple | 
  ApiResData<any> |
  ApiErrorRes;

export type CommonApiResponseCode = 'SUCCESS' |
  'NOT_IMPLEMENTED' | 
  'FORBIDDEN';

export const CommonApiResponses: Record<CommonApiResponseCode, ApiResponse> = {
  SUCCESS: {
    success: true,
  },
  NOT_IMPLEMENTED: {
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'This endpoint is not implemented yet.',
    },
  },
  FORBIDDEN: {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You are not authorized to access this resource or perform this action.',
    },
  },
};