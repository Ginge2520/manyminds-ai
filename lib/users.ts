import bcrypt from "bcryptjs";
import type { User, UserWithPassword } from "./types";

const users = new Map<string, UserWithPassword>();
const emailIndex = new Map<string, string>();

function nextUsageResetDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

export function publicUser(user: UserWithPassword): User {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  useCase?: string;
}) {
  const email = input.email.toLowerCase().trim();
  if (emailIndex.has(email)) {
    throw new Error("An account already exists for this email.");
  }

  const id = crypto.randomUUID();
  const user: UserWithPassword = {
    id,
    name: input.name.trim(),
    email,
    plan: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    usageThisMonth: 0,
    usageResetDate: nextUsageResetDate(),
    onboarded: false,
    createdAt: new Date().toISOString(),
    passwordHash: await bcrypt.hash(input.password, 12),
  };

  users.set(id, user);
  emailIndex.set(email, id);
  return publicUser(user);
}

export async function verifyUser(email: string, password: string) {
  const id = emailIndex.get(email.toLowerCase().trim());
  if (!id) return null;
  const user = users.get(id);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? publicUser(user) : null;
}

export function getUserById(id: string) {
  const user = users.get(id);
  return user ? publicUser(user) : null;
}

export function markUserOnboarded(id: string) {
  const user = users.get(id);
  if (!user) return null;
  user.onboarded = true;
  return publicUser(user);
}

export function updateUserPlan(id: string, plan: User["plan"], stripe?: Partial<User>) {
  const user = users.get(id);
  if (!user) return null;
  user.plan = plan;
  user.stripeCustomerId = stripe?.stripeCustomerId ?? user.stripeCustomerId;
  user.stripeSubscriptionId = stripe?.stripeSubscriptionId ?? user.stripeSubscriptionId;
  return publicUser(user);
}

export function incrementUsage(id: string) {
  const user = users.get(id);
  if (!user) return null;
  user.usageThisMonth += 1;
  return publicUser(user);
}
