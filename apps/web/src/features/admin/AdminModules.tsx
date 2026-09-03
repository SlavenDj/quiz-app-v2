import { Link } from "react-router-dom";
import { useState } from "react";
import { useAdminModules, useCreateModule, useDeleteModule } from "./api";

export function AdminModules() {
  const { data, isLoading, error } = useAdminModules();
  const create = useCreateModule();
  const del = useDeleteModule();
  const [name, setName] = useState("");

  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;

  return (
    <div>
      <h1>Admin — Moduli</h1>
      <form
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
        <input placeholder="Naziv modula" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
        <button>Dodaj modul</button>
      </form>
      {data.map((m: any) => (
        <div key={m.id}>
          <h3>
            {m.name} ({m.status}, kvizova: {m.totalQuizzes})
          </h3>
          <Link to={`/admin/modules/${m.id}`}>Kvizovi</Link>{" "}
          <button
            onClick={async () => {
              if (confirm(`Obrisati ${m.name}?`)) await del.mutateAsync(m.id);
            }}
          >
            Obrisi
          </button>
        </div>
      ))}
    </div>
  );
}
