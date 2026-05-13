function formatTime(t?: string) {
  if (!t) return "0:00:00.00"; // 🔥 tránh crash

  const safe = t.replace(",", ".");

  const parts = safe.split(":");
  if (parts.length !== 3) return "0:00:00.00";

  const [h, m, s] = parts;

  return `${parseInt(h || "0")}:${m}:${parseFloat(s).toFixed(2)}`;
}

export function srtToAss(srt: string) {
  debugger;
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

export function srtToAssSingle(srt: string) {
  debugger;
  // 1. Chuẩn hóa xuống dòng: Chuyển tất cả \r\n về \n để dễ xử lý
  const normalizedSrt = srt.replace(/\r\n/g, "\n").trim();
  
  // 2. Chia block: Tách theo 2 hoặc nhiều dấu xuống dòng
  const blocks = normalizedSrt.split(/\n\s*\n/);

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
    const lines = block.split("\n").map(l => l.trim()).filter(l => l !== "");

    // Một block chuẩn ít nhất phải có: Số thứ tự, Thời gian, và Text
    if (lines.length < 3) {
      console.log(`Dòng số ${lines[0]} không đủ thông tin Số thứ tự, Thời gian, Tiếng anh và Tiếng Việt`);
      continue; 
    }
    // Tìm dòng chứa thời gian (thường là dòng 1 hoặc 2 tùy file)
    const timeLineIndex = lines.findIndex(l => l.includes("-->"));
    if (timeLineIndex === -1) {
      console.log(`Dòng số ${lines[0]} không chứa thời gian`);
      continue;
    }
    const timeLine = lines[timeLineIndex];
    const [startRaw, endRaw] = timeLine.split(" --> ");

    const start = formatTime(startRaw);
    const end = formatTime(endRaw);

    // Lấy phần text sau dòng thời gian
    // Giả sử dòng đầu sau time là EN, dòng tiếp theo là VI
    const en = lines[timeLineIndex + 1] || "";
    const vi = lines[timeLineIndex + 2] || "";

    if (!en && !vi) {
      console.log(`Dòng số ${lines[0]} không có nội dung phụ đề`);
      continue;
    }

    // Gộp vào kết quả
    result += `Dialogue: 0,${start},${end},EN,,0,0,0,,${en}${vi ? `\\N{\\c&H00FFFF&}${vi}` : ""}\n`;
  }

  return result;
}