import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { sendEmail } from "../../../../lib/email";

async function readRawBody(req) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function verifySignature(raw, signature, secret) {
  const h = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature || ""));
}

export async function POST(req) {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  const raw = await readRawBody(req);
  const sig = req.headers.get("x-hope-signature") || "";

  if (secret) {
    // If secret provided, enforce signature check
    try {
      if (!verifySignature(raw, sig, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload = {};
  try { payload = JSON.parse(raw.toString("utf-8")); } catch {}

  // Expected minimal payload (you can change later to Revolut actual schema):
  // { orderId: "...", status: "paid", paymentRef: "..." }
  const { orderId, status, paymentRef } = payload || {};
  if (!orderId || status !== "paid") {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid", paidAt: new Date(), paymentRef: paymentRef || undefined },
    include: { user: true }
  });

  await sendEmail({
    to: updated.user.email,
    subject: "HOPE_IRL: Payment verified ✅",
    html: `<div style="font-family:Arial,sans-serif"><h2>Payment verified ✅</h2><p>Your payment has been verified and we will start working on your request.</p><p><b>Order:</b> ${updated.id}</p></div>`
  });

  return NextResponse.json({ ok: true });
}
