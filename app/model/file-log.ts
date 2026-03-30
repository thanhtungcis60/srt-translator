export type FileLog = {
  name: string;
  status: "w" | "p" | "s" | "e";//w-waiting, p-processing, s-success, e-error
  progress: number;
  message?: string;
};