import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useVerifyEmail } from "./hooks";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { AuthLayout, AuthError } from "./AuthLayout";

export function VerifyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const verify = useVerifyEmail();
  const { register, handleSubmit } = useForm<{ code: string }>();

  const userId = Number(id);
  if (!Number.isFinite(userId)) {
    return (
      <AuthLayout
        title="Verifikacija"
        subtitle="Provjera email adrese."
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        }
      >
        <AuthError message="Neispravan link za verifikaciju." />
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-400">
          <Link to="/register" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Registruj se ponovo
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Provjeri email"
      subtitle="6-cifreni kod smo poslali na tvoj email."
      icon={
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (data) => {
          await verify.mutateAsync({ userId, code: data.code });
          navigate("/login");
        })}
      >
        <TextInput
          id="code"
          label="Verifikacioni kod"
          placeholder="••••••"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="w-full text-center text-lg font-bold tracking-[0.5em]"
          {...register("code", { required: true, minLength: 6, maxLength: 6 })}
        />
        {verify.isError && <AuthError message={(verify.error as Error).message} />}
        <Button type="submit" disabled={verify.isPending} className="min-h-[48px] w-full rounded-xl text-base">
          {verify.isPending ? "Provjera..." : "Potvrdi email"}
        </Button>
        <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
          Pogrešan email?{" "}
          <Link to="/register" className="font-semibold text-brand-quiz dark:text-fuchsia-300 hover:underline">
            Registruj se ponovo
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
