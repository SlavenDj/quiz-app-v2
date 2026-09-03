import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useVerifyEmail } from "./hooks";

export function VerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const verify = useVerifyEmail();
  const { register, handleSubmit } = useForm<{ code: string }>();

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await verify.mutateAsync({ userId: Number(id), code: data.code });
        navigate("/login");
      })}
    >
      <h1>Verifikacija</h1>
      <p>Kod smo poslali na vas email (dev: provjeri API log).</p>
      <input placeholder="6-cifreni kod" {...register("code", { required: true, minLength: 6, maxLength: 6 })} />
      {verify.isError && <p>{(verify.error as Error).message}</p>}
      <button disabled={verify.isPending}>Potvrdi</button>
    </form>
  );
}
