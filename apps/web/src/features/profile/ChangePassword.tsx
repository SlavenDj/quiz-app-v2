import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "./api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

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
  const [showPasswords, setShowPasswords] = useState(false);
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

  const isSuccess = message === "Lozinka promenjena.";

  return (
    <Card title="Lozinka" className="shadow-card">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextInput
          id="currentPassword"
          label="Trenutna lozinka"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <TextInput
          id="newPassword"
          label="Nova lozinka"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <TextInput
          id="confirm"
          label="Potvrda lozinke"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((s) => !s)}
          className="self-start text-sm font-medium text-brand-quiz hover:underline"
        >
          {showPasswords ? "Sakrij lozinke" : "Prikaži lozinke"}
        </button>
        <Button
          type="submit"
          variant="primary"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? "Čuvanje..." : "Promeni lozinku"}
        </Button>
      </form>
      {message && (
        <p
          role="status"
          className={
            isSuccess
              ? "mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-status-success ring-1 ring-green-200"
              : "mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-status-danger ring-1 ring-red-200"
          }
        >
          {message}
        </p>
      )}
    </Card>
  );
}
