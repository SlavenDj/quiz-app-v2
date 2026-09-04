import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "./api";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { PasswordStrength } from "../../components/PasswordStrength";

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

const REQUIREMENTS = ["Najmanje 8 karaktera", "Potvrda se mora poklapati"];

export function ChangePassword() {
  const [message, setMessage] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const mutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const newPasswordValue = watch("newPassword", "");

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

  const isSuccess = message === "Lozinka promenjena.";

  return (
    <Card className="shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-muted/25 text-lg font-bold text-brand-quiz dark:text-fuchsia-300"
        >
          **
        </span>
        <div>
          <h2 className="text-lg font-semibold">Lozinka</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Redovno je mijenjajte radi sigurnosti</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextInput
          id="currentPassword"
          label="Trenutna lozinka"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div>
          <TextInput
            id="newPassword"
            label="Nova lozinka"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <div className="mt-2">
            <PasswordStrength password={newPasswordValue ?? ""} />
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="text-xs text-gray-500 dark:text-zinc-400">
                • {r}
              </li>
            ))}
          </ul>
        </div>
        <TextInput
          id="confirm"
          label="Potvrda lozinke"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? "Čuvanje..." : "Promeni lozinku"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswords((s) => !s)}
            aria-pressed={showPasswords}
          >
            {showPasswords ? "Sakrij" : "Prikaži"}
          </Button>
        </div>
      </form>
      {message && (
        <Alert tone={isSuccess ? "success" : "error"} className="mt-4">
          {message}
        </Alert>
      )}
    </Card>
  );
}
