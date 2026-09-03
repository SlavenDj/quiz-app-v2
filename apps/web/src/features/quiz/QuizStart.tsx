import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuiz } from "./api";

export function QuizStart() {
  const { id } = useParams();
  const quizId = Number(id);
  const { data, isLoading, error } = useQuiz(quizId);
  const navigate = useNavigate();

  if (isLoading) return <p>Ucitavanje...</p>;
  if (error) return <p>Greska: {(error as Error).message}</p>;

  return (
    <div>
      <Link to={data.moduleId ? `/modules/${data.moduleId}` : "/home"}>Nazad</Link>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <div dangerouslySetInnerHTML={{ __html: data.introHtml }} />
      <p>
        Pitanja: {data.questionCount} | Vrijeme: {Math.floor(data.timeLimitSec / 60)} min | Pokusaji: {data.myAttempts}/
        {data.maxAttempts}
      </p>
      {data.canAttempt ? (
        <button onClick={() => navigate(`/quiz/${quizId}/play`)}>Zapocni kviz</button>
      ) : (
        <p>Nema vise pokusaja.</p>
      )}
    </div>
  );
}
