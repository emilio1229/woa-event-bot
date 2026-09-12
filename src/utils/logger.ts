export function logInfo(message: string, metadata?: Record<string, unknown>) {
  if (metadata) {
    console.log(message, metadata);
    return;
  }

  console.log(message);
}

export function logError(message: string, error: unknown, metadata?: Record<string, unknown>) {
  if (metadata) {
    console.error(message, metadata, error);
    return;
  }

  console.error(message, error);
}
