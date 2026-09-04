import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "validation";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useLogin } from "./hooks";
import { useAuthStore } from "../../stores/auth";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const user = useAuthStore((s) => s.user);
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/modules" : "/home"} replace />;
  }

  return (
    <div className="auth-card">
      <h1 className="text-2xl font-bold text-brand-quiz">Prijava</h1>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={handleSubmit(async (data) => {
          const res = await login.mutateAsync(data);
          const role = res?.user?.role;
          navigate(role === "admin" ? "/admin/modules" : "/home");
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
          id="password"
          label="Lozinka"
          type="password"
          placeholder="Lozinka"
          className="w-full"
          error={errors.password?.message}
          {...register("password")}
        />
        {login.isError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {(login.error as Error).message}
          </p>
        )}
        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? "..." : "Prijavi se"}
        </Button>
        <p className="text-center text-sm text-gray-600">
          <Link to="/register" className="font-medium text-brand-quiz hover:underline">
            Registruj se
          </Link>
          {" | "}
          <Link to="/forgot" className="font-medium text-brand-quiz hover:underline">
            Zaboravljena lozinka?
          </Link>
        </p>
      </form>
    </div>
  );
}
