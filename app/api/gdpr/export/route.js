import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      orders: { include: { items: true, consultant: true, notes: true, resumes: true } },
      resumes: true,
      deleteRequest: true
    }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const payload = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      linkedinUrl: user.linkedinUrl,
      createdAt: user.createdAt
    },
    orders: user.orders,
    resumes: user.resumes,
    deleteRequest: user.deleteRequest
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="hope_irl_my_data_${Date.now()}.json"`
    }
  });
}
