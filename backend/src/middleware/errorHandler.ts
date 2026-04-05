import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError';

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  errorRef: string;
  code?: string;
  errors?: { [key: string]: string };
}

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId: req.requestId ?? 'unknown',
    errorRef: randomUUID(),
  };

  if (err instanceof ZodError) {
    errorResponse.error = 'Validation Error';
    errorResponse.message = 'Invalid request data';
    errorResponse.statusCode = 400;

    const formattedErrors: { [key: string]: string } = {};
    err.issues.forEach((issue: any) => {
      const field = issue.path.join('.');
      formattedErrors[field] = issue.message;
    });
    errorResponse.errors = formattedErrors;
    errorResponse.code = 'VALIDATION_ERROR';
  } else if (err instanceof HttpError) {
    errorResponse.error =
      err.statusCode === 404
        ? 'Not Found'
        : err.statusCode === 400
          ? 'Bad Request'
          : 'HTTP Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    if (err.code) {
      errorResponse.code = err.code;
    }
  } else if (err.statusCode) {
    errorResponse.error = err.name || 'HTTP Error';
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    if (typeof err.code === 'string') {
      errorResponse.code = err.code;
    }
  } else {
    errorResponse.code = 'INTERNAL_ERROR';
    console.error('Unexpected error:', err);
  }

  console.error(
    JSON.stringify({
      level: 'error',
      requestId: errorResponse.requestId,
      errorRef: errorResponse.errorRef,
      code: errorResponse.code ?? null,
      statusCode: errorResponse.statusCode,
      path: errorResponse.path,
      message: errorResponse.message,
    })
  );

  res.status(errorResponse.statusCode).json(errorResponse);
};

export default errorHandler;
