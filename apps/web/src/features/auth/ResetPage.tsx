import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { AuthLayout, AuthError } from "./AuthLayout";

const schema = z
  .object({
    email: z.string().email("Neispravan email"),
    code: z.string().length(6, "Kod mora imati 6 karaktera"),
    newPassword: z.string().min(8, "Lozinka mora imati najmanje 8 karaktera"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    message: "Lozinke se ne podudaraju",
    path: ["confirm"],
  });
type Form = z.infer<typeof schema>;

export function ResetPage() {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: stateEmail },
  });

  return (
    <AuthLayout
      title="Reset lozinke"
      subtitle="Unesi kod s emaila i izaberi novu lozinku."
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-green-50 dark:bg-green-950 px-4 py-8 text-center ring-1 ring-green-200 dark:ring-green-900">
          <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-xl text-white">
            ✓
          </span>
          <p className="font-bold text-gray-900 dark:text-zinc-100">Lozinka uspješno promijenjena</p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Možeš se prijaviti s novom lozinkom.</p>
          <Link
            to="/login"
            className="mt-1 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-brand-nav px-6 font-medium text-white hover:bg-brand-quiz"
          >
            Prijavi se
          </Link>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (data) => {
            setError(null);
            try {
              await api("/api/auth/reset", {
                method: "POST",
                body: JSON.stringify({ email: data.email, code: data.code, newPassword: data.newPassword }),
              });
              setDone(true);
            } catch (e) {
              setError((e as Error).message);
            }
          })}
        >
          <TextInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="npr. student@gmail.com"
            className="w-full"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextInput
            id="code"
            label="Kod s emaila"
            placeholder="••••••"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="w-full text-center text-lg font-bold tracking-[0.5em]"
            error={errors.code?.message}
            {...register("code")}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput
              id="newPassword"
              label="Nova lozinka"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 karaktera"
              className="w-full"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <TextInput
              id="confirm"
              label="Potvrda lozinke"
              type="password"
              autoComplete="new-password"
              placeholder="Ponovi lozinku"
              className="w-full"
              error={errors.confirm?.message}
              {...register("confirm")}
            />
          </div>
          {error && <AuthError message={error} />}
          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? "Resetovanje..." : "Resetuj lozinku"}
          </Button>
          <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
            <Link to="/login" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
              Nazad na prijavu
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
