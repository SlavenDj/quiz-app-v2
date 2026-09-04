import { Link } from "react-router-dom";
import { useState } from "react";
import { useAdminModules, useCreateModule, useDeleteModule } from "./api";
import { Badge, statusTone } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { TextInput } from "../../components/ui/TextInput";

export function AdminModules() {
  const { data, isLoading, error } = useAdminModules();
  const create = useCreateModule();
  const del = useDeleteModule();
  const [name, setName] = useState("");

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
        <Card key={m.id} className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-semibold">{m.name}</h3>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              <Badge tone="neutral">kvizova: {m.totalQuizzes}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/admin/modules/${m.id}`}
              className="rounded bg-brand-nav px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-quiz"
            >
              Kvizovi
            </Link>
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
        </Card>
      ))}
    </div>
  );
}
