function formatTime(t: string) {
  // 00:00:00,090 → 0:00:00.09
  const [h, m, s] = t.replace(",", ".").split(":");
  return `${parseInt(h)}:${m}:${parseFloat(s).toFixed(2)}`;
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
    if (lines.length < 4) continue;

    const [startRaw, endRaw] = lines[1].split(" --> ");

    const start = formatTime(startRaw);
    const end = formatTime(endRaw);

    const en = lines[2]?.trim();
    const vi = lines[3]?.trim();

    result += `Dialogue: 0,${start},${end},EN,,0,0,0,,${en}\n`;
    result += `Dialogue: 0,${start},${end},VI,,0,0,0,,${vi}\n`;
  }

  return result;
}