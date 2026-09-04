import fs from "node:fs";
import type { Request } from "express";
import type { FileFilterCallback } from "multer";

const IMAGE_MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/** Accept only real image mimetypes; extension is derived from the mimetype,
 *  never from the client filename (blocks evil.svg-as-png stored XSS). */
export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (IMAGE_MIME_EXT[file.mimetype]) return cb(null, true);
  const err: any = new Error("Dozvoljeni su samo JPEG/PNG/WebP.");
  err.status = 400;
  cb(err, false);
}

export function imageFilename(
  _req: Request,
  file: Express.Multer.File,
  cb: (err: Error | null, name: string) => void
) {
  cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${IMAGE_MIME_EXT[file.mimetype] ?? ".bin"}`);
}

/** Multer saves the file before the handler runs — remove it when we 404/400 after. */
export function cleanupUploadedFile(req: Request) {
  const f = (req as any).file as { path: string } | undefined;
  if (f) {
    try {
      fs.unlinkSync(f.path);
    } catch {}
  }
}
