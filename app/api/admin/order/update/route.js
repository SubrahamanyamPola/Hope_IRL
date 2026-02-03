import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { sendEmail } from "../../../../../lib/email";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { orderId, status, consultantId } = body || {};
  if (!orderId || !status) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      consultantId: consultantId || undefined,
      paidAt: status === "paid" ? new Date() : undefined
    },
    include: { user: true }
  });

  // Email notifications (mocked if not configured)
  if (status === "paid") {
    await sendEmail({
      to: updated.user.email,
      subject: "HOPE_IRL: Payment verified ✅",
      html: `<div style="font-family:Arial,sans-serif"><h2>Payment verified ✅</h2><p>Your payment has been verified. Our team will start working on your request.</p><p><b>Order:</b> ${updated.id}</p></div>`
    });
  }
  if (status === "completed") {
    await sendEmail({
      to: updated.user.email,
      subject: "HOPE_IRL: Service completed 🎉",
      html: `<div style="font-family:Arial,sans-serif"><h2>Completed 🎉</h2><p>Your selected service has been completed. Thank you for choosing HOPE_IRL.</p><p><b>Order:</b> ${updated.id}</p></div>`
    });
  }

  return NextResponse.json({ ok: true });
}
