import bcrypt from "bcrypt";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

// Esto se pierde si reinicias el servidor, pero sirve para el ejemplo
export const users: AppUser[] = [];

export function findUserByEmail(email: string): AppUser | null {
  return users.find((u) => u.email === email) ?? null;
}

export async function createUser(
  name: string,
  email: string,
  plainPassword: string
): Promise<AppUser> {
  const exists = findUserByEmail(email);
  if (exists) {
    throw new Error("El email ya está registrado");
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user: AppUser = {
    id: String(Date.now()),
    name,
    email,
    passwordHash,
  };

  users.push(user);
  return user;
}