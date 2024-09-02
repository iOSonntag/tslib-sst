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
  ApiErrorResSimple |
  ApiZodErrorRes |
  ApiErrorRes;

export type CommonApiResponseCode = 'SUCCESS' |
  'NOT_IMPLEMENTED' | 
  'BAD_REQUEST' |
  'FORBIDDEN' |
  'INTERNAL_SERVER_ERROR' |
  'RESOURCE_NOT_FOUND' |
  'RESOURCE_ALREADY_EXISTS' |
  'AUTH_TOKEN_EXPIRED' |
  'AUTH_INVALID' |
  'CLIENT_VERSION_INVALID' |
  'CLIENT_VERSION_DEPRECATED' |
  'CLIENT_STATE_OUTDATED';

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
  BAD_REQUEST: {
    success: false,
    error: {
      code: 'BAD_REQUEST',
      message: 'The request was malformed or invalid.',
    },
  },
  FORBIDDEN: {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You are not authorized to access this resource or perform this action.',
    },
  },
  RESOURCE_NOT_FOUND: {
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested resource was not found. It may have been deleted or never existed.',
    },
  },
  RESOURCE_ALREADY_EXISTS: {
    success: false,
    error: {
      code: 'RESOURCE_ALREADY_EXISTS',
      message: 'The resource already exists. It cannot be created again.',
    },
  },
  AUTH_TOKEN_EXPIRED: {
    success: false,
    error: {
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'The authentication token has expired. Please refresh it.',
    },
  },
  AUTH_INVALID: {
    success: false,
    error: {
      code: 'AUTH_INVALID',
      message: 'The authentication is invalid.',
    },
  },
  CLIENT_VERSION_INVALID: {
    success: false,
    error: {
      code: 'CLIENT_VERSION_INVALID',
      message: 'The client version is invalid.',
    },
  },
  CLIENT_VERSION_DEPRECATED: {
    success: false,
    error: {
      code: 'CLIENT_VERSION_DEPRECATED',
      message: 'The client version is outdated. Please update the application.',
    },
  },
  CLIENT_STATE_OUTDATED: {
    success: false,
    error: {
      code: 'CLIENT_STATE_OUTDATED',
      message: 'The client state is outdated. Please refresh the application and try again.',
    },
  },
};