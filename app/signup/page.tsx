import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <AuthShell title="Create your account" subtitle="Start on Free. No card needed, no sales ambush hiding behind a fern.">
      <form className="grid gap-4" action="/api/auth/signup" method="post">
        {query.error && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
            {query.error === "account_exists"
              ? "An account already exists for that email. Log in instead, or use a different email."
              : "Please check the sign-up details and try again. Passwords need at least 8 characters and must match."}
          </div>
        )}
        <label className="field">
          <span className="field-label">Name</span>
          <input className="field-input" name="name" autoComplete="name" required />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="field-input" name="email" type="email" autoComplete="email" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field">
            <span className="field-label">Password</span>
            <input className="field-input" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input className="field-input" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
          </label>
        </div>
        <label className="field">
          <span className="field-label">What will you use ManyMinds AI for? <span className="text-slate-500">Optional</span></span>
          <textarea className="field-input min-h-24" name="useCase" placeholder="Product ideas, launch planning, client work, research..." />
        </label>
        <div className="rounded-2xl border border-green/20 bg-green/10 p-4 text-sm text-slate-300">
          New users start on <strong className="text-white">Free</strong>: 10 agent runs/month, 3 agents max, no payment details.
        </div>
        <button className="primary-cta" type="submit">Create account</button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link className="font-bold text-aqua" href="/login">Log in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
