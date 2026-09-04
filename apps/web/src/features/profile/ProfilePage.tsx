import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe } from "../auth/hooks";
import { useUpdateMe, type ProfileUser } from "./api";
import { AvatarUpload } from "./AvatarUpload";
import { ChangePassword } from "./ChangePassword";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  nickname: z.string().optional(),
  username: z.string().optional(),
  notifyNewQuiz: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;
const FIELDS: Exclude<keyof FormValues, "notifyNewQuiz">[] = [
  "firstName",
  "lastName",
  "country",
  "city",
  "bio",
  "nickname",
  "username",
];

const FIELD_LABELS: Record<Exclude<keyof FormValues, "notifyNewQuiz">, string> = {
  firstName: "Ime",
  lastName: "Prezime",
  country: "Država",
  city: "Grad",
  bio: "Biografija",
  nickname: "Nadimak",
  username: "Korisničko ime",
};

export function ProfilePage() {
  const { data: user, isLoading, isError, error } = useMe();
  const mutation = useUpdateMe();
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [notifyNewQuiz, setNotifyNewQuiz] = useState(true);

  useEffect(() => {
    if (user) {
      const u = user as ProfileUser;
      reset({
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        country: u.country ?? "",
        city: u.city ?? "",
        bio: u.bio ?? "",
        nickname: u.nickname ?? "",
        username: u.username ?? "",
      });
      setNotifyNewQuiz(u.notifyNewQuiz ?? true);
    }
  }, [user, reset]);

  async function onSubmit(values: FormValues) {
    setMessage(null);
    try {
      await mutation.mutateAsync({ ...values, notifyNewQuiz });
      setMessage("Profil sačuvan.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  if (isLoading) {
    return (
      <main className="page-container">
        <Spinner label="Učitavanje..." />
      </main>
    );
  }
  if (isError) {
    return (
      <main className="page-container">
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-status-danger ring-1 ring-red-200"
        >
          Greška: {(error as Error)?.message ?? "Neuspješno učitavanje profila."}
        </p>
      </main>
    );
  }

  const profile = user as ProfileUser | undefined;
  const isSuccess = message === "Profil sačuvan.";

  return (
    <main className="page-container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Moj profil</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-600">{profile?.email}</p>
          {profile?.role && <Badge tone="brand">{profile.role}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Card title="Profil" className="shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FIELDS.map((name) => (
                <div key={name} className={name === "bio" ? "sm:col-span-2" : undefined}>
                  <TextInput id={name} label={FIELD_LABELS[name]} {...register(name)} />
                </div>
              ))}
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? "Čuvanje..." : "Sačuvaj"}
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyNewQuiz}
                onChange={(e) => setNotifyNewQuiz(e.target.checked)}
              />
              Obavijesti o novim kvizovima
            </label>
            {message && (
              <p
                role="status"
                className={
                  isSuccess
                    ? "rounded-md bg-green-50 px-3 py-2 text-sm text-status-success ring-1 ring-green-200"
                    : "rounded-md bg-red-50 px-3 py-2 text-sm text-status-danger ring-1 ring-red-200"
                }
              >
                {message}
              </p>
            )}
          </form>
        </Card>

        <div className="flex flex-col gap-6">
          <AvatarUpload />
          <ChangePassword />
        </div>
      </div>
    </main>
  );
}
