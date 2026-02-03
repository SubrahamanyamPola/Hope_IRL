import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SERVICES } from "../../../../lib/constants";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { orderId, serviceIds } = body || {};
    if (!orderId || !Array.isArray(serviceIds)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email }});
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true }});
    if (!order || order.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.orderItem.deleteMany({ where: { orderId } });

    const chosen = SERVICES.filter(s => serviceIds.includes(s.id));
    const totalCents = chosen.reduce((sum, s) => sum + s.priceCents, 0);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        totalCents,
        status: chosen.length ? "awaiting_payment" : "draft",
        items: {
          create: chosen.map((s) => ({
            serviceId: s.id,
            title: s.title,
            priceCents: s.priceCents,
            period: s.period
          }))
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
