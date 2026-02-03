import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" }
  });

  const header = ["orderId","createdAt","status","totalEUR","fullName","email","phone","linkedinUrl","services","paymentRef","resumeUrl"];
  const rows = orders.map((o) => ([
    o.id,
    o.createdAt.toISOString(),
    o.status,
    (o.totalCents/100).toFixed(2),
    o.fullName || o.user?.name || "",
    o.user?.email || "",
    o.phone || o.user?.phone || "",
    o.linkedinUrl || o.user?.linkedinUrl || "",
    o.items.map(i => i.title).join(" | "),
    o.paymentRef || "",
    o.resumeFileUrl || ""
  ]));

  const csv = [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="hope_irl_orders_${Date.now()}.csv"`
    }
  });
}
