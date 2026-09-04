import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { registerSchema } from "validation";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useRegister } from "./hooks";
import { useAuthStore } from "../../stores/auth";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { PasswordStrength } from "../../components/PasswordStrength";

export function RegisterPage() {
  const navigate = useNavigate();
  const reg = useRegister();
  const user = useAuthStore((s) => s.user);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.input<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  const passwordValue = watch("password", "");

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;
  }

  return (
    <div className="auth-card">
      <h1 className="text-2xl font-bold text-brand-quiz">Registracija</h1>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={handleSubmit(async (data) => {
          setLocalError(null);
          const res = await reg.mutateAsync(data);
          if (Number.isFinite(res?.userId)) {
            navigate(`/verify/${res.userId}`);
          } else {
            setLocalError("Registracija nije uspjela. Pokušajte ponovo.");
          }
        })}
      >
        <TextInput
          id="firstName"
          label="Ime"
          placeholder="Ime"
          className="w-full"
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <TextInput
          id="lastName"
          label="Prezime"
          placeholder="Prezime"
          className="w-full"
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        <TextInput
          id="email"
          label="Email"
          placeholder="Email"
          className="w-full"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextInput
          id="password"
          label="Lozinka"
          type="password"
          placeholder="Lozinka (min 8)"
          className="w-full"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrength password={passwordValue ?? ""} />
        <TextInput
          id="country"
          label="Država"
          placeholder="Drzava"
          className="w-full"
          error={errors.country?.message}
          {...register("country")}
        />
        <TextInput
          id="city"
          label="Grad"
          placeholder="Grad"
          className="w-full"
          error={errors.city?.message}
          {...register("city")}
        />
        {reg.isError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {(reg.error as Error).message}
          </p>
        )}
        {localError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError}
          </p>
        )}
        <Button type="submit" disabled={reg.isPending} className="w-full">
          {reg.isPending ? "..." : "Registruj se"}
        </Button>
        <p className="text-center text-sm text-gray-600">
          <Link to="/login" className="font-medium text-brand-quiz hover:underline">
            Vec imas nalog?
          </Link>
        </p>
      </form>
    </div>
  );
}
