// export function splitSrt(content: string, size = 80) {
//   const fixed = fixContent(content);

//   const blocks = fixed.split(/\n{2,}/).filter(Boolean);

//   const chunks = [];

//   for (let i = 0; i < blocks.length; i += size) {
//     chunks.push(blocks.slice(i, i + size).join("\n\n"));
//   }

//   return chunks;

//   return chunks;
// }
export function splitSrt(content: string, batchSize = 15) {
  const fixed = fixContent(content);

  // 🔥 tách theo block subtitle
  const blocks = fixed.split(/\n\s*\n/).filter(Boolean);

  const chunks: string[] = [];

  for (let i = 0; i < blocks.length; i += batchSize) {
    const group = blocks.slice(i, i + batchSize).join("\n\n");
    chunks.push(group);
  }

  return chunks;
}

function fixContent(content: string) {
  if (content.includes("\\n")) {
    try {
      content = JSON.parse(`"${content}"`);
    } catch {}
  }

  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
