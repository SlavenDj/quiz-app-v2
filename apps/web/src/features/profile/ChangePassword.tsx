import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "./api";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Obavezno."),
    newPassword: z.string().min(8, "Minimum 8 karaktera."),
    confirm: z.string().min(1, "Obavezno."),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: "Lozinke se ne poklapaju.",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export function ChangePassword() {
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setMessage(null);
    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setMessage("Lozinka promenjena.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  return (
    <section>
      <h3>Promena lozinke</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="currentPassword">Trenutna lozinka</label>
          <input id="currentPassword" type="password" {...register("currentPassword")} />
          {errors.currentPassword && <p>{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="newPassword">Nova lozinka</label>
          <input id="newPassword" type="password" {...register("newPassword")} />
          {errors.newPassword && <p>{errors.newPassword.message}</p>}
        </div>
        <div>
          <label htmlFor="confirm">Potvrda lozinke</label>
          <input id="confirm" type="password" {...register("confirm")} />
          {errors.confirm && <p>{errors.confirm.message}</p>}
        </div>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Čuvanje..." : "Promeni lozinku"}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
