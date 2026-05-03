import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your AI product room. The agents have been pretending not to wait.">
      <form className="grid gap-4" action="/api/auth/login" method="post">
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
