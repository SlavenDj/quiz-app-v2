import { Link, useParams } from "react-router-dom";
import { useModule } from "./api";

export function ModuleDetail() {
  const { id } = useParams();
  const { data, isLoading, error } = useModule(Number(id));
  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;
  return (
    <div>
      <Link to="/home">Nazad</Link>
      <h1>
        Modul {data.moduleNumber}: {data.name}
      </h1>
      <p>{data.longDesc}</p>
      <p>Broj kvizova: {data.quizzes.length}</p>
      {data.quizzes.map((q: any) => (
        <div key={q.quizId}>
          <h3>{q.quizName}</h3>
          <p>{q.description}</p>
          <p>
            Bodovi: {q.lastScore ?? "-"} | Pokusaji: {q.myAttempts}/{q.maxAttempts}
          </p>
          {q.canAttempt ? <Link to={`/quiz/${q.quizId}`}>Zapocni</Link> : <span>Nema vise pokusaja</span>}
        </div>
      ))}
    </div>
  );
}
