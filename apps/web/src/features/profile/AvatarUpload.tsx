import { useState } from "react";
import { useMe } from "../auth/hooks";
import { useDeleteAvatar, useUploadAvatar } from "./api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUpload() {
  const { data: user } = useMe();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const upload = useUploadAvatar();
  const del = useDeleteAvatar();

  const avatarFile = (user as { avatarFile?: string | null } | undefined)?.avatarFile;

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

  return (
    <section>
      <h3>Avatar</h3>
      {avatarFile ? (
        <img src={`${API_URL}/uploads/${avatarFile}`} alt="Avatar" width={120} />
      ) : (
        <p>no avatar</p>
      )}
      <div>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onSelect} />
      </div>
      <button type="button" onClick={onUpload} disabled={!file || upload.isPending}>
        {upload.isPending ? "Upload..." : "Upload"}
      </button>
      {avatarFile && (
        <button type="button" onClick={onDelete} disabled={del.isPending}>
          {del.isPending ? "Brisanje..." : "Obriši avatar"}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
