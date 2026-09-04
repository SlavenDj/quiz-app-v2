import { useEffect, useRef, useState } from "react";
import { useMe } from "../auth/hooks";
import { useDeleteAvatar, useUploadAvatar, type ProfileUser } from "./api";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT_ATTR = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

function describeFile(f: File): string | null {
  if (!ACCEPTED.includes(f.type)) return "Samo JPEG, PNG ili WEBP.";
  if (f.size > MAX_BYTES) return "Slika je prevelika (max 5MB).";
  return null;
}

export function AvatarUpload() {
  const { data: user } = useMe();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar();
  const del = useDeleteAvatar();

  const profile = user as ProfileUser | undefined;
  const identity = profile?.username || profile?.nickname || profile?.email || "";
  const initial = (identity.trim().charAt(0) || "?").toUpperCase();

  // Instant preview of the pending file; revoked on change/unmount.
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function pick(f: File | null) {
    setMessage(null);
    if (!f) {
      setFile(null);
      return;
    }
    const problem = describeFile(f);
    if (problem) {
      setMessage(problem);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(f);
  }

  async function onUpload() {
    if (!file) return;
    setMessage(null);
    try {
      await upload.mutateAsync(file);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setMessage("Avatar postavljen.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  async function onDelete() {
    setMessage(null);
    try {
      await del.mutateAsync();
      setMessage("Avatar obrisan.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  const isSuccess = message === "Avatar postavljen." || message === "Avatar obrisan.";
  const shown = preview ?? null;

  return (
    <Card title="Slika" className="shadow-card">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <AvatarFace name={identity} initial={initial} preview={shown} currentFile={profile?.avatarFile ?? null} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-zinc-100">
              {profile?.username || profile?.email || "Korisnik"}
            </p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">JPEG, PNG ili WEBP do 5MB.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-brand-nav bg-brand-muted/20" : "border-brand-muted/60 hover:border-brand-quiz"
          }`}
        >
          <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
            {file ? file.name : "Prevuci sliku ovde ili klikni za izbor"}
          </span>
          <span className="text-xs text-gray-500 dark:text-zinc-400">
            {file
              ? `${(file.size / 1024).toFixed(0)} KB — spremno za upload`
              : "Pregled se pojavljuje odmah"}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="sr-only"
          aria-label="Nova slika"
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onUpload}
            loading={upload.isPending}
            disabled={!file}
            className="sm:w-auto sm:min-w-[140px]"
          >
            {upload.isPending ? "Upload..." : "Sačuvaj sliku"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="outline"
              onClick={() => pick(null)}
              disabled={upload.isPending}
              className="sm:w-auto"
            >
              Otkaži
            </Button>
          )}
          {profile?.avatarFile && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              loading={del.isPending}
              className="sm:ml-auto sm:w-auto"
            >
              {del.isPending ? "Brisanje..." : "Obriši avatar"}
            </Button>
          )}
        </div>

        {message && (
          <Alert tone={isSuccess ? "success" : "error"}>{message}</Alert>
        )}
      </div>
    </Card>
  );
}

import { avatarSrc } from "../../lib/avatar";

function AvatarFace({ name, initial, preview, currentFile }: { name: string; initial: string; preview: string | null; currentFile: string | null }) {
  const src = preview ?? avatarSrc(currentFile, name);
  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar — ${name}`}
        className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-brand-muted"
      />
    );
  }
  return (
    <div
      role="img"
      aria-label="Avatar"
      className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-muted/25 text-2xl font-semibold text-brand-quiz dark:text-fuchsia-300 ring-2 ring-brand-muted/40"
    >
      {initial}
    </div>
  );
}
