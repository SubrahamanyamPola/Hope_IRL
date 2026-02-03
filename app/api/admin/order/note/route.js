import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const orderId = body?.orderId;
    const text = body?.text;

    if (!orderId || !text || !String(text).trim()) {
      return NextResponse.json(
        { ok: false, error: "orderId and text are required" },
        { status: 400 }
      );
    }

    // ✅ DB query is inside the handler (never at top-level)
    const note = await prisma.orderNote.create({
      data: {
        orderId: String(orderId),
        text: String(text).trim(),
      },
    });

    return NextResponse.json({ ok: true, note });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
