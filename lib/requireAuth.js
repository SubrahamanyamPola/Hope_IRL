import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session?.user?.role !== "admin") redirect("/dashboard");
  return session;
}
