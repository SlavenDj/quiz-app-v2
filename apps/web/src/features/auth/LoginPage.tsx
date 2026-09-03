import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "validation";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "./hooks";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await login.mutateAsync(data);
        navigate("/home");
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
