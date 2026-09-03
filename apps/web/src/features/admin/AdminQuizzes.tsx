import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useModule } from "../quiz/api";
import { useCreateQuiz, useDeleteQuiz } from "./api";

export function AdminQuizzes() {
  const { id } = useParams();
  const moduleId = Number(id);
  const { data, isLoading, error } = useModule(moduleId);
  const create = useCreateQuiz(moduleId);
  const del = useDeleteQuiz();
  const [name, setName] = useState("");

  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;

  return (
    <div>
      <Link to="/admin/modules">Nazad</Link>
      <h1>
        {data.name} — kvizovi ({data.quizzes.length})
      </h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await create.mutateAsync({ name, description: "" });
          setName("");
        }}
      >
        <input placeholder="Naziv kviza" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} />
        <button>Dodaj kviz</button>
      </form>
      {data.quizzes.map((q: any) => (
        <div key={q.quizId}>
          <h3>{q.quizName}</h3>
          <p>{q.description}</p>
          <Link to={`/admin/quiz/${q.quizId}/edit`}>Uredi pitanja</Link>{" "}
          <button
            onClick={async () => {
              if (confirm(`Obrisati ${q.quizName}?`)) await del.mutateAsync(q.quizId);
            }}
          >
            Obrisi
          </button>
        </div>
      ))}
    </div>
  );
}
