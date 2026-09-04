import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY ?? "";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendQuizPublishedEmail(to: string, quizName: string, moduleName: string) {
  const subject = `Novi kviz: ${quizName}`;
  const html = `<p>Objavljen je novi kviz <strong>${quizName}</strong> u modulu <strong>${moduleName}</strong>.</p>`;
  if (!resend) {
    console.log(`[dev mail] to=${to} subject=${subject}`);
    return;
  }
  await resend.emails.send({ from: "verification@plusultra.ba", to, subject, html });
}
export async function sendCodeEmail(to: string, code: string, kind: "verify" | "reset") {
  const subject = kind === "verify" ? "Verifikacijski kod" : "Reset lozinke";
  const html = `<p>Vas kod: <strong>${code}</strong></p><p>Vazi 15 minuta.</p>`;
  if (!resend) {
    console.log(`[dev mail] to=${to} subject=${subject} code=${code}`);
    return;
  }
  await resend.emails.send({ from: "verification@plusultra.ba", to, subject, html });
}
