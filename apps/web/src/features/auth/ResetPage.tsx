import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

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
    <div className="auth-card">
      <h1 className="text-2xl font-bold text-brand-quiz">Reset lozinke</h1>
      {done ? (
        <p className="mt-4 text-sm text-gray-700">
          Lozinka uspješno promijenjena.{" "}
          <Link to="/login" className="font-medium text-brand-quiz hover:underline">
            Prijavite se
          </Link>
        </p>
      ) : (
        <form
          className="mt-4 flex flex-col gap-4"
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
            placeholder="Email"
            className="w-full"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextInput
            id="code"
            label="Kod"
            placeholder="6-cifreni kod"
            className="w-full"
            error={errors.code?.message}
            {...register("code")}
          />
          <TextInput
            id="newPassword"
            label="Nova lozinka"
            type="password"
            className="w-full"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <TextInput
            id="confirm"
            label="Potvrda lozinke"
            type="password"
            className="w-full"
            error={errors.confirm?.message}
            {...register("confirm")}
          />
          {error && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "..." : "Resetuj lozinku"}
          </Button>
        </form>
      )}
    </div>
  );
}
