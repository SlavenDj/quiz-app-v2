import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useVerifyEmail } from "./hooks";

export function VerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const verify = useVerifyEmail();
  const { register, handleSubmit } = useForm<{ code: string }>();

  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return (
      <main>
        <h1>Verifikacija</h1>
        <p>Neispravan link</p>
      </main>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await verify.mutateAsync({ userId, code: data.code });
        navigate("/login");
      })}
    >
      <h1>Verifikacija</h1>
      <p>Kod smo poslali na vas email.</p>
      <input placeholder="6-cifreni kod" {...register("code", { required: true, minLength: 6, maxLength: 6 })} />
      {verify.isError && <p>{(verify.error as Error).message}</p>}
      <button disabled={verify.isPending}>Potvrdi</button>
    </form>
  );
}
