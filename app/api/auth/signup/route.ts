import { redirect } from "next/navigation";
import { z } from "zod";
import { setSessionCookie, toSessionUser } from "@/lib/auth";
import { createUser } from "@/lib/users";

const signupSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    useCase: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const form = Object.fromEntries(await request.formData());
    const data = signupSchema.parse(form);
    const user = await createUser(data);
    await setSessionCookie(toSessionUser(user));
  } catch (error) {
    const code = error instanceof Error && error.message.includes("already exists") ? "account_exists" : "invalid_signup";
    redirect(`/signup?error=${code}`);
  }

  redirect("/dashboard");
}
