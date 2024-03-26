import { ZodIssue } from 'zod';




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

export type ApiErrorResSimple = ApiErrorResBase & {};
export type ApiZodErrorRes = ApiErrorResBase & {
  error: {
    code: 'INVALID_PAYLOAD';
    message: 'The payload does not match the expected schema.';
  };
  zod: {
    version: string;
    issues: ZodIssue[];
  };
};

export type ApiErrorRes = ApiResBase | ApiErrorResBase;

export type ApiResponse = ApiResSimple | 
  ApiResData<any> |
  ApiErrorRes;

export type CommonApiResponseCode = 'SUCCESS' |
  'NOT_IMPLEMENTED' | 
  'FORBIDDEN' |
  'INTERNAL_SERVER_ERROR';

export const CommonApiResponses: Record<CommonApiResponseCode, ApiResponse> = {
  SUCCESS: {
    success: true,
  },
  INTERNAL_SERVER_ERROR: {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred.',
    },
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