import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "validation";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useLogin } from "./hooks";
import { useAuthStore } from "../../stores/auth";

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
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await login.mutateAsync(data);
        const role = res?.user?.role;
        navigate(role === "admin" ? "/admin/modules" : "/home");
      })}
    >
      <h1>Prijava</h1>
      <input placeholder="Email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" placeholder="Lozinka" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      {login.isError && <p>{(login.error as Error).message}</p>}
      <button disabled={login.isPending}>{login.isPending ? "..." : "Prijavi se"}</button>
      <Link to="/register">Registruj se</Link> | <Link to="/forgot">Zaboravljena lozinka?</Link>
    </form>
  );
}
