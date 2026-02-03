import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { profileSchema, paymentSchema } from "../../../../lib/validators";
import { uploadResume } from "../../../../lib/storage";
import { sendEmail } from "../../../../lib/email";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const orderId = formData.get("orderId");
  const fullName = formData.get("fullName") || "";
  const phone = formData.get("phone") || "";
  const linkedinUrl = formData.get("linkedinUrl") || "";
  const paymentRef = formData.get("paymentRef") || "";
  const resume = formData.get("resume");

  const p1 = profileSchema.safeParse({ fullName, phone, linkedinUrl });
  if (!p1.success) return NextResponse.json({ error: p1.error.issues[0]?.message || "Invalid profile" }, { status: 400 });

  const p2 = paymentSchema.safeParse({ paymentRef });
  if (!p2.success) return NextResponse.json({ error: p2.error.issues[0]?.message || "Invalid payment ref" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email }});
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true }});
  if (!order || order.userId != user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  let resumeFileName = null;
  let resumeFileUrl = null;
  let storageProvider = "local";

  if (resume && typeof resume === "object" && resume.name) {
    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await uploadResume({ buffer, originalName: resume.name });
    resumeFileName = uploaded.fileName;
    resumeFileUrl = uploaded.url;
    storageProvider = uploaded.provider;

    // Keep CV history
    await prisma.resume.create({
      data: {
        userId: user.id,
        orderId: orderId,
        fileName: resumeFileName,
        fileUrl: resumeFileUrl,
        storageProvider
      }
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      fullName,
      phone,
      linkedinUrl: linkedinUrl || null,
      resumeFileName,
      resumeFileUrl,
      paymentRef,
      status: "payment_submitted"
    }
  });

  // Email notification (safe mock if no RESEND_API_KEY)
  await sendEmail({
    to: session.user.email,
    subject: "HOPE_IRL: We received your order",
    html: `<div style="font-family:Arial,sans-serif"><h2>Order received ✅</h2><p>Thanks for choosing HOPE_IRL. Your request has been received and our team will connect soon.</p><p><b>Status:</b> payment_submitted</p><p><b>Order ID:</b> ${updatedOrder.id}</p></div>`
  });

  return NextResponse.json({ ok: true });
}
