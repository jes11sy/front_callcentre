type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function unwrapApiData<T>(payload: unknown): T {
  if (!isObject(payload)) {
    return payload as T;
  }

  const hasSuccessFlag = 'success' in payload;
  const envelope = payload as ApiEnvelope<T>;

  if (!hasSuccessFlag) {
    return payload as T;
  }

  if (envelope.success === false) {
    throw new Error(envelope.message || 'Ошибка API');
  }

  if ('data' in envelope) {
    return envelope.data as T;
  }

  return payload as T;
}

export function extractApiMessage(payload: unknown): string | undefined {
  if (!isObject(payload)) {
    return undefined;
  }

  const message = payload.message;
  return typeof message === 'string' ? message : undefined;
}

