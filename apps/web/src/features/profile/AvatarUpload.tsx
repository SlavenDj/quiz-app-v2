import { useState } from "react";
import { useMe } from "../auth/hooks";
import { useDeleteAvatar, useUploadAvatar, type ProfileUser } from "./api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload() {
  const { data: user } = useMe();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const upload = useUploadAvatar();
  const del = useDeleteAvatar();

  const profile = user as ProfileUser | undefined;
  const avatarFile = profile?.avatarFile;

  const identity = profile?.username || profile?.nickname || profile?.email || "";
  const initial = (identity.trim().charAt(0) || "?").toUpperCase();

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(null);
    const f = e.target.files?.[0] ?? null;
    if (f && !ACCEPTED.includes(f.type)) {
      setMessage("Samo jpeg/png/webp.");
      setFile(null);
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

  return (
    <Card title="Slika" className="shadow-card">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {avatarFile ? (
            <img
              src={`${API_URL}/uploads/${avatarFile}`}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover ring-2 ring-brand-muted"
            />
          ) : (
            <div
              role="img"
              aria-label="Avatar"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-muted/25 text-2xl font-semibold text-brand-quiz ring-2 ring-brand-muted/40"
            >
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {profile?.username || profile?.email || "Korisnik"}
            </p>
            <p className="text-xs text-gray-500">JPEG, PNG ili WEBP.</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="avatar-file" className="text-sm font-medium">
            Nova slika
          </label>
          <input
            id="avatar-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onSelect}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-brand-quiz file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition-colors hover:file:bg-brand-nav"
          />
        </div>
        {file && (
          <p className="truncate text-sm text-gray-600">
            Izabrano: <span className="font-medium text-gray-900">{file.name}</span>
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            onClick={onUpload}
            disabled={!file || upload.isPending}
          >
            {upload.isPending ? "Upload..." : "Upload"}
          </Button>
          {avatarFile && (
            <Button type="button" variant="danger" onClick={onDelete} disabled={del.isPending}>
              {del.isPending ? "Brisanje..." : "Obriši avatar"}
            </Button>
          )}
        </div>

        {message && (
          <p
            role="status"
            className={
              isSuccess
                ? "rounded-md bg-green-50 px-3 py-2 text-sm text-status-success ring-1 ring-green-200"
                : "rounded-md bg-red-50 px-3 py-2 text-sm text-status-danger ring-1 ring-red-200"
            }
          >
            {message}
          </p>
        )}
      </div>
    </Card>
  );
}
