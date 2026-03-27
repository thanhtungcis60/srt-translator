export async function translateChunks(chunks: string[]) {
  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ text: chunks[i] })
      });

      const data = await res.json();
      results.push(data.result);

      // 🔥 delay tránh rate limit
      await new Promise(r => setTimeout(r, 2000));

    } catch {
      // retry
      i--;
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  return results.join("\n");
}