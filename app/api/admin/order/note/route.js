import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { orderId, content } = body || {};
  if (!orderId || !content || content.trim().length < 2) {
    return NextResponse.json({ error: "Note content is required" }, { status: 400 });
  }

  await prisma.orderNote.create({
    data: {
      orderId,
      authorId: me.id,
      content: content.trim()
    }
  });

  return NextResponse.json({ ok: true });
}
