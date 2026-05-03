import { redirect } from "next/navigation";
import { z } from "zod";
import { setSessionCookie, toSessionUser } from "@/lib/auth";
import { verifyUser } from "@/lib/users";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const form = Object.fromEntries(await request.formData());
  const credentials = loginSchema.parse(form);
  const user = await verifyUser(credentials.email, credentials.password);
  if (!user) {
    redirect("/login?error=invalid_credentials");
  }
  await setSessionCookie(toSessionUser(user));
  redirect("/dashboard");
}
