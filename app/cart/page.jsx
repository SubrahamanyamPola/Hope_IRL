import { requireUser } from "../../lib/requireAuth";
import { prisma } from "../../lib/prisma";
import { Card, SectionTitle } from "../../components/ui";
import { CartClient } from "./ui";

export default async function CartPage() {
  const session = await requireUser();

  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    return (
      <Card>
        <h3 className="text-white font-extrabold text-lg">Please sign in</h3>
        <p className="text-white/70 mt-2">Your session doesn’t have an email. Please login again.</p>
        <a className="btn-primary w-full mt-4" href="/auth/login">
          Go to Login
        </a>
      </Card>
    );
  }

  // ✅ Ensure user exists in DB (prevents null user crash)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session.user.name || undefined,
      image: session.user.image || undefined,
    },
    create: {
      email,
      name: session.user.name || "User",
      image: session.user.image || null,
      role: "user",
    },
  });

  const order = await prisma.order.findFirst({
    where: { userId: user.id, status: { in: ["draft", "awaiting_payment", "payment_submitted"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Cart & Checkout"
        subtitle="Confirm your services, upload CV, and submit payment reference."
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CartClient order={order} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-white font-extrabold text-lg">Payment</h3>
            <p className="text-white/70 mt-2">
              After paying, paste the payment reference.
            </p>
            <div className="mt-4">
              <a
                className="btn-primary w-full"
                href={order?.paymentLink || process.env.NEXT_PUBLIC_REVOLUT_LINK || "https://revolut.me/yourdummy"}
                target="_blank"
              >
                Pay with Revolut
              </a>
            </div>
            <p className="text-white/50 text-xs mt-2">
              Your details will be secured.
            </p>
          </Card>

          <Card>
            <h3 className="text-white font-extrabold text-lg">After payment</h3>
            <p className="text-white/70 mt-2">Once you submit, our team will contact you on WhatsApp/call.</p>

            <div className="mt-4 text-white/60 text-sm">You can also email support in future versions.</div>

            <div className="mt-3">
              <a className="btn-secondary w-full" href="/orders">
                View order status
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
