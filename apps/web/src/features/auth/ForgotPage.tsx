import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { AuthLayout, AuthError } from "./AuthLayout";

const schema = z.object({ email: z.string().email("Neispravan email") });
type Form = z.infer<typeof schema>;

export function ForgotPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  return (
    <AuthLayout
      title="Zaboravljena lozinka"
      subtitle="Unesi email — poslat ćemo ti 6-cifreni kod za reset."
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (data) => {
          setError(null);
          try {
            await api("/api/auth/forgot", {
              method: "POST",
              body: JSON.stringify(data),
            });
            setSent(true);
            setSentEmail(data.email);
            navigate("/reset", { state: { email: data.email } });
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
        {error && <AuthError message={error} />}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          {isSubmitting ? "Slanje..." : "Pošalji kod"}
        </Button>
      </form>
      {sent && (
        <section className="mt-4 rounded-xl bg-gray-50 dark:bg-zinc-900 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 ring-1 ring-gray-200 dark:ring-zinc-700">
          <p>Kod je poslan na vaš email.</p>
          <Link to="/reset" state={{ email: sentEmail }} className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Idi na reset
          </Link>
        </section>
      )}
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
        Sjetio si se lozinke?{" "}
        <Link to="/login" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
          Nazad na prijavu
        </Link>
      </p>
    </AuthLayout>
  );
}
