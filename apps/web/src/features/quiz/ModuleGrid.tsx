import { useState } from "react";
import { Link } from "react-router-dom";
import { useEditions, useModules } from "./api";

export function ModuleGrid() {
  const [edition, setEdition] = useState<string | undefined>(undefined);
  const { data: editions } = useEditions();
  const { data, isLoading, error } = useModules(edition);
  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;
  if (!data?.length) return <p>Nema dostupnih modula.</p>;
  return (
    <div>
      <h1>Moduli</h1>
      <select value={edition ?? ""} onChange={(e) => setEdition(e.target.value || undefined)}>
        <option value="">Sve edicije</option>
        {(editions ?? []).map((ed: string) => (
          <option key={ed} value={ed}>
            {ed}
          </option>
        ))}
      </select>
      {data.map((m: any) => (
        <div key={m.id}>
          <h2>
            Modul {m.moduleNumber}: {m.name}
          </h2>
          <p>{m.shortDesc}</p>
          <p>
            Status: {m.status} | Kvizova: {m.totalQuizzes}
          </p>
          {m.status === "Locked" ? <span>Zakljucano</span> : <Link to={`/modules/${m.id}`}>Pogledaj kvizove</Link>}
        </div>
      ))}
    </div>
  );
}
