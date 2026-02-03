import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.redirect(new URL("/auth/login", req.url));

  const form = await req.formData();
  const reason = form.get("reason")?.toString() || null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!user) return NextResponse.redirect(new URL("/account", req.url));

  await prisma.deleteRequest.upsert({
    where: { userId: user.id },
    update: { reason, status: "requested" },
    create: { userId: user.id, reason, status: "requested" }
  });

  return NextResponse.redirect(new URL("/account", req.url));
}
