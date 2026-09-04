import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useVerifyEmail } from "./hooks";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";

export function VerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const verify = useVerifyEmail();
  const { register, handleSubmit } = useForm<{ code: string }>();

  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return (
      <div className="auth-card">
        <h1 className="text-2xl font-bold text-brand-quiz">Verifikacija</h1>
        <p className="mt-2 text-sm text-gray-600">Neispravan link</p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1 className="text-2xl font-bold text-brand-quiz">Verifikacija</h1>
      <p className="mt-1 text-sm text-gray-600">Kod smo poslali na vas email.</p>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={handleSubmit(async (data) => {
          await verify.mutateAsync({ userId, code: data.code });
          navigate("/login");
        })}
      >
        <TextInput
          id="code"
          label="Kod"
          placeholder="6-cifreni kod"
          className="w-full"
          {...register("code", { required: true, minLength: 6, maxLength: 6 })}
        />
        {verify.isError && (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {(verify.error as Error).message}
          </p>
        )}
        <Button type="submit" disabled={verify.isPending} className="w-full">
          {verify.isPending ? "..." : "Potvrdi"}
        </Button>
      </form>
    </div>
  );
}
