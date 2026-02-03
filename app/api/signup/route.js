import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { signupSchema } from "../../../lib/validators";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { name, email, password, phone, linkedinUrl } = parsed.data;
    const emailLc = email.toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email: emailLc }});
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email: emailLc, passwordHash, phone: phone || null, linkedinUrl: linkedinUrl || null }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
