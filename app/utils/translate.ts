import { hashChunk, getCache, setCache } from "./cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function translateChunk(chunk: any, retry = 3) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const key = hashChunk(chunk);

  // ✅ cache hit
  const cached = getCache(key);
  if (cached) return cached;

  // 🔥 call Gemini
  const res = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `
Translate SRT EN→VI
Keep format EXACT
Bilingual (EN + VI)
Return ONLY SRT

${chunk}
`,
            },
          ],
        },
      ],
    }),
  });
  const textRaw = await res.text();

  if (!res.ok) {
    if (res.status === 429 && retry > 0) {
      const retryMatch = textRaw.match(/retry in ([\d.]+)s/i);
      const wait = retryMatch ? parseFloat(retryMatch[1]) * 1000 : 60000;

      console.warn(`429 Rate limit → wait ${wait}ms (retry ${retry})`);

      await new Promise(r => setTimeout(r, wait));

      return translateChunk(chunk, retry - 1); // retry
    }
    // 🔥 503 → retry tăng dần
    if (res.status === 503 && retry > 0) {
      const wait = (4 - retry) * 3000; // 3s → 6s → 9s

      console.warn(`503 → retry after ${wait}ms (retry ${retry})`);

      await new Promise(r => setTimeout(r, wait));

      return translateChunk(chunk, retry - 1);
    }
    throw new Error("Gemini  API ERROR: " + textRaw);
  }

  const data = JSON.parse(textRaw);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  setCache(key, text);

  return text;
}
