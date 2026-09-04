import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../lib/api";

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
    <main>
      <h1>Reset lozinke</h1>
      {done ? (
        <p>
          Lozinka uspješno promijenjena. <Link to="/login">Prijavite se</Link>
        </p>
      ) : (
        <form
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
          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Email" {...register("email")} />
          {errors.email && <p>{errors.email.message}</p>}
          <label htmlFor="code">Kod</label>
          <input id="code" placeholder="6-cifreni kod" {...register("code")} />
          {errors.code && <p>{errors.code.message}</p>}
          <label htmlFor="newPassword">Nova lozinka</label>
          <input id="newPassword" type="password" {...register("newPassword")} />
          {errors.newPassword && <p>{errors.newPassword.message}</p>}
          <label htmlFor="confirm">Potvrda lozinke</label>
          <input id="confirm" type="password" {...register("confirm")} />
          {errors.confirm && <p>{errors.confirm.message}</p>}
          {error && <p>{error}</p>}
          <button disabled={isSubmitting}>{isSubmitting ? "..." : "Resetuj lozinku"}</button>
        </form>
      )}
    </main>
  );
}
