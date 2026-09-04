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
import { AuthLayout, AuthError } from "./AuthLayout";

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
    <AuthLayout
      title="Napravi nalog"
      subtitle="Besplatno je — za minut si na rang listi."
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        </svg>
      }
    >
      <form
        className="flex flex-col gap-4"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            id="firstName"
            label="Ime"
            placeholder="npr. Amina"
            autoComplete="given-name"
            className="w-full"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextInput
            id="lastName"
            label="Prezime"
            placeholder="npr. Hodžić"
            autoComplete="family-name"
            className="w-full"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextInput
          id="email"
          label="Email"
          type="email"
          placeholder="npr. amina@gmail.com"
          autoComplete="email"
          className="w-full"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <TextInput
            id="password"
            label="Lozinka"
            type="password"
            autoComplete="new-password"
            placeholder="Minimum 8 karaktera"
            className="w-full"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-2">
            <PasswordStrength password={passwordValue ?? ""} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            id="country"
            label="Država"
            placeholder="npr. BiH"
            autoComplete="country-name"
            className="w-full"
            error={errors.country?.message}
            {...register("country")}
          />
          <TextInput
            id="city"
            label="Grad"
            placeholder="npr. Sarajevo"
            autoComplete="address-level2"
            className="w-full"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>
        {reg.isError && <AuthError message={(reg.error as Error).message} />}
        {localError && <AuthError message={localError} />}
        <Button type="submit" size="lg" fullWidth loading={reg.isPending}>
          {reg.isPending ? "Registracija..." : "Registruj se"}
        </Button>
        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
          Već imaš nalog?{" "}
          <Link to="/login" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Prijavi se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
