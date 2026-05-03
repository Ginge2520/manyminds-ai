import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your AI product room. The agents have been pretending not to wait.">
      <form className="grid gap-4" action="/api/auth/login" method="post">
        {query.error === "invalid_credentials" && (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm font-bold text-red-100">
            Those login details did not match an account. Try again or create a new free account.
          </div>
        )}
        <label className="field">
          <span className="field-label">Email</span>
          <input className="field-input" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="field">
          <span className="field-label">Password</span>
          <input className="field-input" name="password" type="password" autoComplete="current-password" required />
        </label>
        <div className="flex items-center justify-between text-sm">
          <Link className="font-bold text-aqua" href="/forgot-password">Forgot password?</Link>
          <Link className="font-bold text-slate-300" href="/signup">Create account</Link>
        </div>
        <button className="primary-cta" type="submit">Log in</button>
      </form>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button className="secondary-cta" type="button">Continue with Google</button>
        <button className="secondary-cta" type="button">Continue with Apple</button>
      </div>
    </AuthShell>
  );
}
