import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { registerSchema } from "validation";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "./hooks";

export function RegisterPage() {
  const navigate = useNavigate();
  const reg = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm<z.input<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        const res = await reg.mutateAsync(data);
        navigate(`/verify/${res.userId}`);
      })}
    >
      <h1>Registracija</h1>
      <input placeholder="Ime" {...register("firstName")} />
      {errors.firstName && <p>{errors.firstName.message}</p>}
      <input placeholder="Prezime" {...register("lastName")} />
      {errors.lastName && <p>{errors.lastName.message}</p>}
      <input placeholder="Email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" placeholder="Lozinka (min 8)" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      <input placeholder="Drzava" {...register("country")} />
      {errors.country && <p>{errors.country.message}</p>}
      <input placeholder="Grad" {...register("city")} />
      {errors.city && <p>{errors.city.message}</p>}
      {reg.isError && <p>{(reg.error as Error).message}</p>}
      <button disabled={reg.isPending}>{reg.isPending ? "..." : "Registruj se"}</button>
      <Link to="/login">Vec imas nalog?</Link>
    </form>
  );
}
