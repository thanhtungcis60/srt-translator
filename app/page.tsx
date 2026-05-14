"use client";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { FileLog } from "./model";
import { splitSrt, srtToAss, srtToAssSingle } from "./utils";
import ReformatSRT from "./utils/reformat-srt";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [logs, setLogs] = useState<FileLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initLog = (files: File[]) => {
    setLogs(
      files.map((f) => ({
        name: f.name,
        status: "w",
        progress: 0,
      })),
    );
  };

  const updateLog = (name: string, data: Partial<FileLog>) => {
    setLogs((prev) => prev.map((log) => (log.name === name ? { ...log, ...data } : log)));
  };

  const handleRetry = async (fileName: string) => {
    const file = files.find((f) => f.name === fileName);
    if (!file) return;

    await processFile(file);
  };

  const processFile = async (file: File) => {
    updateLog(file.name, { status: "p", progress: 0 });
    debugger;
    try {
      const text = await file.text();
      const chunks = splitSrt(text, 80);

      let final = "";
      const res = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({ chunks }),
      });
      if (!res){
        console.log("Empty response")
        throw new Error("Empty response");
      } 
      console.log("Response: ", res);

      const data = await res.json();
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((r: any, i: number) => {
        if (r.success) {
          final += r.text + "\n\n";
        } else {
          console.log(`Chunk ${i}: ${r.message || "failed"}`);
          throw new Error(`Chunk ${i}: ${r.message || "failed"}`);
        }

        updateLog(file.name, {
          progress: Math.round(((i + 1) / data.length) * 100),
        });
      });

      if (!final.includes("-->")) {
        console.log("Invalid SRT format from Gemini");
        throw new Error("Invalid SRT format from Gemini");
      }

      const ass = srtToAss(final);
      downloadFile(ass, file.name);

      updateLog(file.name, {
        status: "s",
        progress: 100,
        message: "OK",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      updateLog(file.name, {
        status: "e",
        message: err.message,
      });
    }
  };

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content]);

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);

    const name = filename.replace(/\.[^/.]+$/, "");
    a.download = `${name}_en_vi.ass`;

    a.click();
  }
  function downloadFileSRT(content: string, filename: string) {
    const blob = new Blob([content]);

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);

    const name = filename.replace(/\.[^/.]+$/, "");
    a.download = `${name}_formatted.srt`;

    a.click();
  }

  const handleTranslateAll = async () => {
    setLoading(true);
    for (const file of files) {
      await processFile(file);
    }
    setLoading(false);
  };

  const handleConvertToAss= async () => {
    setLoading(true);
    for (const file of files) {
      try{
        const text = await file.text();
        const ass = srtToAssSingle(text);
        downloadFile(ass, file.name);
        updateLog(file.name, {
          status: "s",
          progress: 100,
          message: "OK",
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        updateLog(file.name, {
          status: "e",
          message: err.message,
        });
      }
    }
    setLoading(false);
  };
  
  const handleReformatSrt= async () => {
    setLoading(true);
    for (const file of files) {
      try{
        const text = await file.text();
        const srt = ReformatSRT(text);
        downloadFileSRT(srt, file.name);
        updateLog(file.name, {
          status: "s",
          progress: 100,
          message: "OK",
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        updateLog(file.name, {
          status: "e",
          message: err.message,
        });
      }
    }
    setLoading(false);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>
        SRT Translator (Gemini Free)
      </Typography>

      <Box
        onDrop={(e) => {
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
            onChange={(e) => {
              setFiles(Array.from(e.target.files || []));
              initLog(Array.from(e.target.files || []));
            }}
          />
        </Button>

        {files.length > 0 && <Typography sx={{ mt: 2 }}>Đã chọn {files.length} file</Typography>}
      </Box>
      <Button variant="contained" color="primary" disabled={loading || files.length === 0} onClick={handleTranslateAll} sx={{ mt: 2, mr: 2 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : "Translate script file"}
      </Button>
      <Button variant="contained" color="success" disabled={loading || files.length === 0} onClick={handleConvertToAss} sx={{ mt: 2, mr: 2  }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : "SRT --> ASS"}
      </Button>
      <Button variant="contained" color="secondary" disabled={loading || files.length === 0} onClick={handleReformatSrt} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : "Reformat SRT file"}
      </Button>

      {mounted && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.name}>
                <TableCell sx={{ maxWidth: 100 }}>{log.name}</TableCell>

                <TableCell>
                  {log.status === "s" && <Chip size="small" label="Success" color="success" />}
                  {log.status === "e" && <Chip size="small" label="Error" color="error" />}
                  {log.status === "p" && <Chip size="small" label="Processing" color="warning" />}
                  {log.status === "w" && <Chip size="small" label="Waiting" />}
                </TableCell>

                <TableCell sx={{ verticalAlign: "middle", width: 250 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 24 }}>
                    <LinearProgress variant="determinate" value={log.progress} sx={{ flex: 1, height: 8, borderRadius: 5 }} />
                    <Typography sx={{ minWidth: 35 }}>{log.progress}%</Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ maxWidth: 300 }}>{log.message}</TableCell>

                <TableCell>
                  {log.status === "e" && (
                    <Button variant="outlined" size="small" onClick={() => handleRetry(log.name)}>
                      Retry
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Container>
  );
}
