"use client";

import { useState } from "react";
import { Button, CircularProgress, Container, Typography } from "@mui/material";
import { splitSrt, srtToAss, translateChunks } from "./utils";

export default function Home() {
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    setLoading(true);
    const text = await file.text();
    if(text && text!==''){
      setFileName(file.name.replace(/\.[^/.]+$/, "")); // bỏ .srt
      const chunks = splitSrt(text, 80);
      const result = await translateChunks(chunks);
      // 🔥 convert sang ASS
      const ass = srtToAss(result);

      setOutput(ass);
      setLoading(false);
    }
    
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 2 }}>
        SRT Translator (Gemini Free)
      </Typography>

      <input type="file" onChange={handleFile} />

      <Button
        variant="contained"
        disabled={loading}
        onClick={() => {
          const blob = new Blob([output]);
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `${fileName}_en_vi.ass`;
          a.click();
        }}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Download script file"}
      </Button>

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
        {output}
      </pre>
    </Container>
  );
}