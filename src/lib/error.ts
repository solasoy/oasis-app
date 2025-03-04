export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
}

export function handleApiError(error: AppError | Error | unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500
    };
  }

  return {
    message: 'An unknown error occurred',
    status: 500
  };
} 