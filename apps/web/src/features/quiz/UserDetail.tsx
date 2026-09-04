import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { avatarSrc } from "../../lib/avatar";

interface UserDetailData {
  userId: number;
  firstName: string;
  lastName: string;
  username: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  avatarFile: string | null;
  avatarUrl: string | null;
  totalScore: number;
  quizzesPlayed: number;
  rank: number | null;
}

export function UserDetail() {
  const { userId } = useParams();
  const id = Number(userId);
  const idValid = userId !== undefined && !Number.isNaN(id);
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api(`/api/users/${id}`) as Promise<UserDetailData>,
    enabled: idValid,
  });

  if (!idValid) return <p className="page-container text-status-danger">Neispravan link.</p>;
  if (isLoading) return <Spinner label="Ucitavanje..." />;
  if (error) return <p className="page-container text-status-danger">Greska: {(error as Error).message}</p>;
  if (!data) return <Spinner label="Ucitavanje..." />;

  const u = data;
  const initial = (u.firstName?.[0] ?? "?").toUpperCase();
  const location = [u.country, u.city].filter(Boolean).join(", ");
  const avatar = avatarSrc(u.avatarFile, `${u.firstName} ${u.lastName}`) ?? u.avatarUrl;

  return (
    <div className="page-container">
      <Card className="mx-auto w-full max-w-2xl rounded-card text-center shadow-card">
        {avatar ? (
          <img src={avatar} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-muted/25 text-2xl font-bold text-brand-quiz">
            {initial}
          </span>
        )}
        <h1 className="mt-2 break-words text-2xl font-bold text-gray-900">
          {u.firstName} {u.lastName}
        </h1>
        {u.username ? <p className="break-words text-sm text-gray-500">@{u.username}</p> : null}
        {location ? <p className="mt-1 break-words text-sm text-gray-500">{location}</p> : null}
        {u.rank != null ? (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge tone="brand">rang #{u.rank}</Badge>
          </div>
        ) : null}
        {u.bio ? <p className="mt-2 break-words text-sm text-gray-700">{u.bio}</p> : null}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-card bg-gray-50 px-2 py-3">
            <p className="text-xl font-bold text-gray-900">{u.totalScore}</p>
            <p className="text-xs text-gray-500">bodovi</p>
          </div>
          <div className="rounded-card bg-gray-50 px-2 py-3">
            <p className="text-xl font-bold text-gray-900">{u.quizzesPlayed}</p>
            <p className="text-xs text-gray-500">kvizovi</p>
          </div>
          <div className="rounded-card bg-gray-50 px-2 py-3">
            <p className="text-xl font-bold text-gray-900">{u.rank ?? "—"}</p>
            <p className="text-xs text-gray-500">rang</p>
          </div>
        </div>
      </Card>
      <div className="mx-auto mt-4 w-full max-w-2xl">
        <Link
          to="/leaderboard"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded bg-brand-nav px-4 py-2 font-medium text-white transition-colors hover:bg-brand-quiz"
        >
          Nazad na rang listu
        </Link>
      </div>
    </div>
  );
}
