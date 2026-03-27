export function splitSrt(content: string, size = 80) {
  const blocks = content.split("\n\n");
  const chunks = [];

  for (let i = 0; i < blocks.length; i += size) {
    chunks.push(blocks.slice(i, i + size).join("\n\n"));
  }

  return chunks;
}