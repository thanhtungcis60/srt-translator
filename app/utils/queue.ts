// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runWithConcurrency<T>(items: T[], worker: (item: T, index: number) => Promise<any>, concurrency = 3, delayMs = 300) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = [];
  let index = 0;
  let isRateLimited = false;

  async function runner() {
    while (index < items.length) {
      if (isRateLimited) return;
      const currentIndex = index++;
      try {
        const res = await worker(items[currentIndex], currentIndex);
        results[currentIndex] = res;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err:any) {
        if (err.message.includes("429")) {
          isRateLimited = true;
        }
        results[currentIndex] = { error: err };
      }

      await sleep(delayMs);
    }
  }

  const workers = Array(concurrency).fill(0).map(runner);
  await Promise.all(workers);

  return results;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
