import { runWithConcurrency } from "@/app/utils";
import { translateChunk } from "@/app/utils/translate";

export async function POST(req: Request) {
  console.log("route.ts: 🔥 API HIT");
  const { chunks } = await req.json();

  // 🚀 chạy queue
  const results = await runWithConcurrency(
    chunks,
    async (chunk:string, i) => {
      try {
        const text = await translateChunk(chunk);
        return { success: true, text, index: i };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Chunk error:", {
          index: i,
          error: err.message,
          chunk: chunk.slice(0, 200), // chỉ log 200 ký tự đầu
        });
        return { error: true, chunk, index: i };
      }
    },
    1, // concurrency
    1200, // delay
  );

  // 🔥 retry failed
  const failed = results.filter((r) => r?.error);

  if (failed.length > 0) {
    const retryResults = await runWithConcurrency(
      failed,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (item: any) => {
        try {
          const text = await translateChunk(item.chunk);
          return { success: true, text, index: item.index };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
           console.error("Chunk error:", {
            index: item.index,
            error: err.message,
            chunk: item.chunk.slice(0, 200), // chỉ log 200 ký tự đầu
          });
          return { error: true, chunk: item.chunk, index: item.index };
        }
      },
      1,
      1500,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    retryResults.forEach((r: any) => {
      if (!r.error) {
        results[r.index] = r;
      }
    });
  }

  return Response.json(results);
}
