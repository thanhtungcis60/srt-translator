"use client";

import { useState } from "react";
import { Alert, Box, Button, CircularProgress, Container, LinearProgress, Typography } from "@mui/material";
import { splitSrt, srtToAss, translateChunks } from "./utils";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content]);

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);

    const name = filename.replace(/\.[^/.]+$/, "");
    a.download = `${name}_en_vi.ass`;

    a.click();
  }

  const handleTranslateAll = async () => {
    if (!files.length) return;

    setLoading(true);
    setProgress(0);
    setFileName("");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setFileName(file.name);

      const text = await file.text();

      const chunks = splitSrt(text, 80);

      let final = "";

      for (let j = 0; j < chunks.length; j++) {
        const chunk = chunks[j];

        try {
          const res = await fetch("/api/translate", {
            method: "POST",
            body: JSON.stringify({ text: chunk })
          });
          const data = await res.json();

          final += data.result + "\n\n";

          // 🔥 update progress theo chunk
          const percent = ((i + (j + 1) / chunks.length) / files.length) * 100;

          setProgress(Math.round(percent));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          setError(err.message || "Có lỗi xảy ra");
          setTimeout(() => {
            setError(null);
          }, 5000);
          await new Promise((r) => setTimeout(r, 3000));
          j--; // retry
        }
        

        // ⚠️ tránh rate limit
        await new Promise((r) => setTimeout(r, 2000));
      }

      const ass = srtToAss(final);

      downloadFile(ass, file.name);
    }

    setFiles([]);
    setLoading(false);
  };

  return (
    <Container>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="h4" sx={{ mt: 2 }}>
        SRT Translator (Gemini Free)
      </Typography>

      {loading && (
        <Box sx={{ mt: 3 }}>
          <Typography>
            Đang xử lý: {fileName}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flex: 1, height: 8, borderRadius: 5 }}
            />

            <Typography sx={{ minWidth: 40 }}>
              {progress}%
            </Typography>
          </Box>
        </Box>
      )}

      <Box onDrop={(e) => {
          e.preventDefault();
          setFiles(Array.from(e.dataTransfer.files));
        }}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          border: "2px dashed #aaa",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          mt: 2,
          cursor: "pointer",
          backgroundColor: "#fafafa",
          "&:hover": { backgroundColor: "#f0f0f0" },
        }}
      >
        <Typography>Kéo file .srt vào đây</Typography>

        <Button variant="outlined" sx={{ mt: 2 }} component="label">
          Chọn file
          <input
            hidden
            type="file"
            multiple
            accept=".srt"
            onChange={(e) =>
              setFiles(Array.from(e.target.files || []))
            }
          />
        </Button>

        {files.length > 0 && (
          <Typography sx={{ mt: 2 }}>
            Đã chọn {files.length} file
          </Typography>
        )}
      </Box>

      <Button
        variant="contained"
        disabled={loading || files.length === 0}
        onClick={handleTranslateAll}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Process script file"}
      </Button>
    </Container>
  );
}