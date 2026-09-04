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
import { avatarSrc } from "../../lib/avatar";

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
  const displayName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.username ||
    profile?.email ||
    "Korisnik";
  const heroAvatar = avatarSrc(profile?.avatarFile, displayName);
  const heroInitial = (displayName.trim().charAt(0) || "?").toUpperCase();

  return (
    <main className="page-container">
      <section className="relative mb-6 overflow-hidden rounded-card bg-gradient-to-r from-brand-nav via-brand-quiz to-brand-auth p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {heroAvatar ? (
            <img
              src={heroAvatar}
              alt=""
              className="h-20 w-20 shrink-0 rounded-full border-4 border-white/60 object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label="Avatar"
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/60 bg-white/20 text-3xl font-bold"
            >
              {heroInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Moj profil</p>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/85">
              <span className="truncate">{profile?.email}</span>
              {profile?.role && (
                <Badge tone="neutral">
                  <span className="text-gray-700">{profile.role}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        <Card title="Lični podaci" className="shadow-card lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FIELDS.map((name) => (
                <div key={name} className={name === "bio" ? "sm:col-span-2" : undefined}>
                  <TextInput id={name} label={FIELD_LABELS[name]} {...register(name)} />
                </div>
              ))}
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-card bg-gray-50 px-3 py-2.5 text-sm ring-1 ring-gray-200">
              <span>
                <span className="block font-medium text-gray-900">Obavijesti o novim kvizovima</span>
                <span className="block text-xs text-gray-500">Email kada se objavi novi kviz</span>
              </span>
              <input
                type="checkbox"
                checked={notifyNewQuiz}
                onChange={(e) => setNotifyNewQuiz(e.target.checked)}
                className="h-5 w-5 shrink-0 accent-brand-quiz"
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className="min-h-[44px] w-full sm:w-auto"
            >
              {mutation.isPending ? "Čuvanje..." : "Sačuvaj promjene"}
            </Button>
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

        <div className="flex flex-col gap-6 lg:col-span-2">
          <AvatarUpload />
          <ChangePassword />
        </div>
      </div>
    </main>
  );
}
