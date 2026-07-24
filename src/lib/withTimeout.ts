// Races a promise against a timer so a slow upstream (e.g. a cold-cache Ceipal
// pull that can take up to a minute) can never block page render past `ms` —
// the caller gets `fallback` instead and the client-rendered component takes
// over from there.
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}
