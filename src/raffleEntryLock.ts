const raffleEntryLocks = new Map<string, Promise<void>>();

export async function withRaffleEntryLock<T>(raffleId: string, callback: () => Promise<T>): Promise<T> {
  const previous = raffleEntryLocks.get(raffleId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>(resolve => {
    release = resolve;
  });

  raffleEntryLocks.set(raffleId, current);
  await previous;

  try {
    return await callback();
  } finally {
    release();

    if (raffleEntryLocks.get(raffleId) === current) {
      raffleEntryLocks.delete(raffleId);
    }
  }
}
