import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

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
    <div className="auth-card">
      <h1 className="text-2xl font-bold text-brand-quiz">Zaboravljena lozinka</h1>
      <form
        className="mt-4 flex flex-col gap-4"
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
          placeholder="Email"
          className="w-full"
          error={errors.email?.message}
          {...register("email")}
        />
        {error && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "..." : "Pošalji kod"}
        </Button>
      </form>
      {sent && (
        <section className="mt-4 rounded bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <p>Kod je poslan na vaš email.</p>
          <Link to="/reset" state={{ email: sentEmail }} className="font-medium text-brand-quiz hover:underline">
            Idi na reset
          </Link>
        </section>
      )}
    </div>
  );
}
