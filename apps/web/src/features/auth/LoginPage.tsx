import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "validation";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useLogin } from "./hooks";
import { useAuthStore } from "../../stores/auth";
import { isDemo } from "../../lib/demo";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { AuthLayout, AuthError } from "./AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);

  const submitLogin = async (data: { email: string; password: string }) => {
    const res = await login.mutateAsync(data);
    const role = res?.user?.role;
    navigate(role === "admin" ? "/admin/modules" : "/home");
  };

  // Dev-only shortcut (stripped from production builds by Vite).
  const devLogin = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
    return submitLogin({ email, password });
  };

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;
  }

  return (
    <AuthLayout
      title="Dobrodošao nazad"
      subtitle="Prijavi se i nastavi skupljati bodove."
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="M10 17l5-5-5-5M15 12H3" />
        </svg>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(submitLogin)}>
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
        <div>
          <div className="relative">
            <TextInput
              id="password"
              label="Lozinka"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Tvoja lozinka"
              className="w-full pr-16"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
              className="absolute bottom-1.5 right-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-quiz hover:bg-brand-muted/20 dark:text-fuchsia-300"
            >
              {showPassword ? "Sakrij" : "Prikaži"}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot" className="text-sm font-medium text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Zaboravljena lozinka?
          </Link>
        </div>
        {login.isError && <AuthError message={(login.error as Error).message} />}
        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          {login.isPending ? "Prijava..." : "Prijavi se"}
        </Button>
        {(import.meta.env.DEV || isDemo) && (
          <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 px-4 py-3 ring-1 ring-gray-200 dark:ring-zinc-700">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">Dev brza prijava</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                disabled={login.isPending}
                onClick={() => devLogin("student@gmail.com", "password123")}
              >
                Student
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-sm"
                disabled={login.isPending}
                onClick={() => devLogin("admin@plusultra.ba", "admin12345")}
              >
                Admin
              </Button>
            </div>
          </div>
        )}
        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
          Nemaš nalog?{" "}
          <Link to="/register" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Registruj se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
