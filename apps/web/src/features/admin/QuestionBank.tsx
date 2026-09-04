import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Select } from "../../components/ui/Select";
import { Spinner } from "../../components/ui/Spinner";
import { TextInput } from "../../components/ui/TextInput";

interface BankItem {
  id: number;
  bodyHtml: string;
  type: string;
  quizCount: number;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").slice(0, 120);
}

export function QuestionBank({ quizId }: { quizId: number }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState({ q: "", type: "" });

  const params = new URLSearchParams();
  if (search.q) params.set("q", search.q);
  if (search.type) params.set("type", search.type);
  const qs = params.toString() ? `?${params.toString()}` : "";

  const { data, isLoading, error } = useQuery<BankItem[]>({
    queryKey: ["admin", "bank", quizId, search.q, search.type],
    queryFn: () => api(`/api/admin/questions${qs}`),
  });

  const attach = useMutation({
    mutationFn: (questionId: number) =>
      api(`/api/admin/quizzes/${quizId}/questions/${questionId}/attach`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "quiz", quizId] });
      qc.invalidateQueries({ queryKey: ["admin", "bank"] });
    },
  });

  return (
    <Card title="Banka pitanja">
      <form
        className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch({ q, type });
        }}
      >
        <div className="min-w-0 flex-1">
          <TextInput
            placeholder="Pretrazi pitanja..."
            aria-label="Pretrazi pitanja"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select
          aria-label="Tip pitanja"
          className="sm:w-auto"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Svi tipovi</option>
          <option value="single">Jedan odgovor</option>
          <option value="multiple">Vise odgovora</option>
          <option value="text">Tekst</option>
        </Select>
        <Button type="submit">Pretrazi</Button>
      </form>
      {isLoading ? <Spinner /> : null}
      {error ? <Alert tone="error">Greska: {(error as Error).message}</Alert> : null}
      {attach.error ? (
        <Alert tone="error" className="mb-2">
          Greska: {(attach.error as Error).message}
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        {data?.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-2 rounded border border-gray-200 px-3 py-2 dark:border-zinc-800">
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm">{stripHtml(item.bodyHtml)}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge tone="neutral">{item.type}</Badge>
                <Badge tone="brand">kvizova: {item.quizCount}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={attach.isPending}
              onClick={() => attach.mutate(item.id)}
            >
              Dodaj u kviz
            </Button>
          </div>
        ))}
        {data && data.length === 0 ? <p className="text-sm text-gray-500 dark:text-zinc-400">Nema rezultata.</p> : null}
      </div>
    </Card>
  );
}
