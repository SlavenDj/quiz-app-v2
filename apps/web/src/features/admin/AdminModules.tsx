import { Link } from "react-router-dom";
import { useState } from "react";
import { useAdminModules, useCreateModule, useDeleteModule, useUpdateModule } from "./api";
import { Badge, statusTone } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { TextInput } from "../../components/ui/TextInput";
import { useCountdown } from "../../lib/useCountdown";

const MODULE_STATUSES = ["Locked", "InProgress", "Finished"] as const;

function AdminModuleCountdown({ startAt }: { startAt: string | Date }) {
  const left = useCountdown(startAt);
  if (!left) return null;
  return <p className="text-sm text-gray-500">🔒 Otključava se za {left}</p>;
}

function toLocalInput(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EditModuleForm({ m, onDone }: { m: any; onDone: () => void }) {
  const update = useUpdateModule();
  const [name, setName] = useState(m.name ?? "");
  const [shortDesc, setShortDesc] = useState(m.shortDesc ?? "");
  const [longDesc, setLongDesc] = useState(m.longDesc ?? "");
  const [editionLabel, setEditionLabel] = useState(m.editionLabel ?? "");
  const [moduleNumber, setModuleNumber] = useState(String(m.moduleNumber ?? ""));
  const [startAt, setStartAt] = useState(toLocalInput(m.startAt));
  const [endAt, setEndAt] = useState(toLocalInput(m.endAt));
  const [status, setStatus] = useState(m.status ?? "Locked");
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-2 border-t border-gray-100 pt-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setFormError(null);
        try {
          await update.mutateAsync({
            id: m.id,
            body: {
              name,
              shortDesc,
              longDesc,
              editionLabel,
              moduleNumber: Number(moduleNumber),
              ...(startAt ? { startAt: new Date(startAt).toISOString() } : {}),
              ...(endAt ? { endAt: new Date(endAt).toISOString() } : {}),
              status,
            },
          });
          onDone();
        } catch (err) {
          setFormError(err instanceof Error ? err.message : "Greška.");
        }
      }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <TextInput label="Naziv" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
        <TextInput
          label="Broj modula"
          type="number"
          value={moduleNumber}
          onChange={(e) => setModuleNumber(e.target.value)}
          required
        />
        <TextInput label="Kratki opis" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} />
        <TextInput label="Edicija" value={editionLabel} onChange={(e) => setEditionLabel(e.target.value)} />
        <div className="sm:col-span-2">
          <TextInput label="Dugi opis" value={longDesc} onChange={(e) => setLongDesc(e.target.value)} />
        </div>
        <TextInput
          label="Početak"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
        <TextInput label="Kraj" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border border-brand-muted bg-white px-3 py-2 outline-none focus:border-brand-quiz"
          >
            {MODULE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {formError ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={update.isPending}>
          {update.isPending ? "Čuvanje..." : "Sačuvaj"}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          Otkaži
        </Button>
      </div>
    </form>
  );
}

export function AdminModules() {
  const { data, isLoading, error } = useAdminModules();
  const create = useCreateModule();
  const del = useDeleteModule();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Greska: {(error as Error).message}
      </p>
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Admin — Moduli</h1>
        <Badge tone="neutral">modula: {data?.length ?? 0}</Badge>
      </div>
      <Card>
        <form
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault();
            await create.mutateAsync({
              name,
              shortDesc: name,
              longDesc: name,
              editionLabel: "2025/26",
              moduleNumber: (data?.length ?? 0) + 1,
              startAt: new Date().toISOString(),
              endAt: new Date(Date.now() + 90 * 86400000).toISOString(),
            });
            setName("");
          }}
        >
          <div className="min-w-0 flex-1">
            <TextInput
              placeholder="Naziv modula"
              aria-label="Naziv modula"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <Button type="submit">Dodaj modul</Button>
        </form>
      </Card>
      {data.map((m: any) => (
        <Card key={m.id} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="break-words font-semibold">{m.name}</h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone={statusTone(m.status)}>{m.status}</Badge>
                <Badge tone="neutral">kvizova: {m.totalQuizzes}</Badge>
              </div>
              {m.status === "Locked" && m.startAt ? (
                <div className="mt-1">
                  <AdminModuleCountdown startAt={m.startAt} />
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/admin/modules/${m.id}`}
                className="rounded bg-brand-nav px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-quiz"
              >
                Kvizovi
              </Link>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => setEditingId(editingId === m.id ? null : m.id)}
              >
                Uredi
              </Button>
              <Button
                variant="danger"
                className="text-sm"
                onClick={async () => {
                  if (confirm(`Obrisati ${m.name}?`)) await del.mutateAsync(m.id);
                }}
              >
                Obrisi
              </Button>
            </div>
          </div>
          {editingId === m.id ? <EditModuleForm m={m} onDone={() => setEditingId(null)} /> : null}
        </Card>
      ))}
    </div>
  );
}
