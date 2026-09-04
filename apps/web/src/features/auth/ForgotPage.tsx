import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

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
    <main>
      <h1>Zaboravljena lozinka</h1>
      <form
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
        <label htmlFor="email">Email</label>
        <input id="email" placeholder="Email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
        {error && <p>{error}</p>}
        <button disabled={isSubmitting}>{isSubmitting ? "..." : "Pošalji kod"}</button>
      </form>
      {sent && (
        <section>
          <p>Kod je poslan na vaš email.</p>
          <Link to="/reset" state={{ email: sentEmail }}>Idi na reset</Link>
        </section>
      )}
    </main>
  );
}
