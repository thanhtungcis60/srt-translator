function formatTime(t?: string) {
  if (!t) return "0:00:00.00"; // 🔥 tránh crash

  const safe = t.replace(",", ".");

  const parts = safe.split(":");
  if (parts.length !== 3) return "0:00:00.00";

  const [h, m, s] = parts;

  return `${parseInt(h || "0")}:${m}:${parseFloat(s).toFixed(2)}`;
}

export function srtToAss(srt: string) {
  const blocks = srt.split("\n\n");

  let result = `[Script Info]
Title: Bilingual Subtitle
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV

Style: EN,Arial,14,&H00FFFFFF,&H00000000,1,2,1,2,10,10,30
Style: VI,Arial,14,&H0000FFFF,&H00000000,1,2,1,2,10,10,10

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
`;

  for (const block of blocks) {
    const lines = block.split("\n");

    if (lines.length < 2) continue; // 🔥 fix

    const timeLine = lines[1];
    if (!timeLine?.includes("-->")) continue;

    const [startRaw, endRaw] = timeLine.split(" --> ");

    const start = formatTime(startRaw);
    const end = formatTime(endRaw);

    const en = lines[2]?.trim() || "";
    const vi = lines[3]?.trim() || "";

    if (!en && !vi) continue;

    result += `Dialogue: 0,${start},${end},EN,,0,0,0,,${en}\\N{\\c&H00FFFF&}${vi}\n`;
   }

  return result;
}