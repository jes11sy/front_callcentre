import { notifications } from '@/components/ui/notifications';
import logger from '@/lib/logger';

type ErrorWithMessage = {
  message?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
};

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  const maybeError = error as ErrorWithMessage;
  const apiMessage = maybeError?.response?.data?.message || maybeError?.response?.data?.error;
  if (apiMessage) {
    return apiMessage;
  }

  if (maybeError?.message) {
    return maybeError.message;
  }

  return fallback;
}

export function notifyApiError(error: unknown, fallback: string, context?: string): void {
  const message = getErrorMessage(error, fallback);
  logger.error(context || 'API error', error);
  notifications.error(message);
}

