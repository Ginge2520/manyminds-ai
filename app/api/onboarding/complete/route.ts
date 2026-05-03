import { redirect } from "next/navigation";
import { currentUser, setSessionCookie, toSessionUser } from "@/lib/auth";
import { markUserOnboarded } from "@/lib/users";

export async function POST() {
  const session = await currentUser();
  if (!session) redirect("/login");
  const user = markUserOnboarded(session.id);
  if (!user) redirect("/login");
  await setSessionCookie(toSessionUser(user));
  redirect("/dashboard");
}
