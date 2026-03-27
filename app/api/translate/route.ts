import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY!;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const body = {
    contents: [
      {
        parts: [
          {
            text: `
Translate SRT EN→VI
Keep format EXACT
Bilingual (EN + VI)
Return ONLY SRT

${text}
`
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(URL, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" }
    });

   
    const data = await res.json();
    console.log('data: ',data);

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ result: output });
  } catch (e) {
    return NextResponse.json({ error: "fail" }, { status: 500 });
  }
}