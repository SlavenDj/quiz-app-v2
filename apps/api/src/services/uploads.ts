import fs from "node:fs";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export function removeUploadedFile(filename: string | null) {
  if (!filename) return;
  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, filename));
  } catch {}
}
