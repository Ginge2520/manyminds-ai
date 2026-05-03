import bcrypt from "bcryptjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { User, UserWithPassword } from "./types";

const users = new Map<string, UserWithPassword>();
const emailIndex = new Map<string, string>();
const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");
let loaded = false;

interface StoredUsers {
  users: UserWithPassword[];
}

function loadUsers() {
  if (loaded) return;
  loaded = true;

  if (!existsSync(usersFile)) return;

  try {
    const data = JSON.parse(readFileSync(usersFile, "utf8")) as StoredUsers;
    for (const user of data.users || []) {
      users.set(user.id, user);
      emailIndex.set(user.email, user.id);
    }
  } catch {
    users.clear();
    emailIndex.clear();
  }
}

function saveUsers() {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(usersFile, JSON.stringify({ users: Array.from(users.values()) } satisfies StoredUsers, null, 2));
}

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
  loadUsers();
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
    usageThisMonth: 0,
    usageResetDate: nextUsageResetDate(),
    onboarded: true,
    createdAt: new Date().toISOString(),
    passwordHash: await bcrypt.hash(input.password, 12),
  };

  users.set(id, user);
  emailIndex.set(email, id);
  saveUsers();
  return publicUser(user);
}

export async function verifyUser(email: string, password: string) {
  loadUsers();
  const id = emailIndex.get(email.toLowerCase().trim());
  if (!id) return null;
  const user = users.get(id);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? publicUser(user) : null;
}

export function getUserById(id: string) {
  loadUsers();
  const user = users.get(id);
  return user ? publicUser(user) : null;
}

export function markUserOnboarded(id: string) {
  loadUsers();
  const user = users.get(id);
  if (!user) return null;
  user.onboarded = true;
  saveUsers();
  return publicUser(user);
}

export function incrementUsage(id: string) {
  loadUsers();
  const user = users.get(id);
  if (!user) return null;
  user.usageThisMonth += 1;
  saveUsers();
  return publicUser(user);
}
