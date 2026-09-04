import { useState } from "react";
import { Link } from "react-router-dom";
import { useEditions, useModules } from "./api";
import { Badge, statusTone } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { useCountdown } from "../../lib/useCountdown";

function ModuleCountdown({ startAt }: { startAt: string | Date }) {
  const left = useCountdown(startAt);
  if (!left) return null;
  return <p className="text-sm text-gray-500">🔒 Otključava se za {left}</p>;
}

export function ModuleGrid() {
  const [edition, setEdition] = useState<string | undefined>(undefined);
  const { data: editions } = useEditions();
  const { data, isLoading, error } = useModules(edition);
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  if (!data?.length) return <p className="page-container text-gray-500">Nema dostupnih modula.</p>;
  return (
    <div className="page-container">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Moduli</h1>
      <select
        value={edition ?? ""}
        onChange={(e) => setEdition(e.target.value || undefined)}
        className="mb-4 min-h-[44px] w-full rounded-card border border-brand-muted bg-white px-3 py-2 text-base text-gray-900 shadow-card sm:max-w-xs"
      >
        <option value="">Sve edicije</option>
        {(editions ?? []).map((ed: string) => (
          <option key={ed} value={ed}>
            {ed}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((m: any) => (
          <Card key={m.id} className="flex min-w-0 flex-col gap-2 rounded-card shadow-card">
            <h2 className="break-words text-lg font-semibold text-gray-900">
              Modul {m.moduleNumber}: {m.name}
            </h2>
            <p className="min-w-0 break-words text-sm text-gray-600">{m.shortDesc}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(m.status)}>{m.status}</Badge>
              <span className="text-sm text-gray-500">Kvizova: {m.totalQuizzes}</span>
            </div>
            <div className="mt-auto pt-2">
              {m.status === "Locked" ? (
                <div className="flex flex-col items-start gap-1">
                  <span className="inline-flex min-h-[44px] items-center rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500">
                    Zakljucano
                  </span>
                  {m.startAt ? <ModuleCountdown startAt={m.startAt} /> : null}
                </div>
              ) : (
                <Link
                  to={`/modules/${m.id}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded bg-brand-nav px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-quiz"
                >
                  Pogledaj kvizove
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
