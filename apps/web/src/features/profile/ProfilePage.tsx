import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe } from "../auth/hooks";
import { useUpdateMe, type ProfileUser } from "./api";
import { AvatarUpload } from "./AvatarUpload";
import { ChangePassword } from "./ChangePassword";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  nickname: z.string().optional(),
  username: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
const FIELDS: (keyof FormValues)[] = [
  "firstName",
  "lastName",
  "country",
  "city",
  "bio",
  "nickname",
  "username",
];

export function ProfilePage() {
  const { data: user, isLoading, isError, error } = useMe();
  const mutation = useUpdateMe();
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      const u = user as ProfileUser;
      reset({
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        country: u.country ?? "",
        city: u.city ?? "",
        bio: u.bio ?? "",
        nickname: u.nickname ?? "",
        username: u.username ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(values: FormValues) {
    setMessage(null);
    try {
      await mutation.mutateAsync(values);
      setMessage("Profil sačuvan.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Greška.");
    }
  }

  if (isLoading) return <p>Učitavanje...</p>;
  if (isError) return <p>Greška: {(error as Error)?.message ?? "Neuspješno učitavanje profila."}</p>;

  return (
    <main>
      <h2>Moj profil</h2>
      <p>{(user as ProfileUser | undefined)?.email}</p>

      <section>
        <h3>Podaci</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          {FIELDS.map((name) => (
            <div key={name}>
              <label htmlFor={name}>{name}</label>
              <input id={name} {...register(name)} />
            </div>
          ))}
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Čuvanje..." : "Sačuvaj"}
          </button>
        </form>
        {message && <p role="status">{message}</p>}
      </section>

      <AvatarUpload />
      <ChangePassword />
    </main>
  );
}
