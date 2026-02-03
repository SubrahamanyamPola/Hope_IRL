import { requireUser } from "../../lib/requireAuth";
import { Card, SectionTitle } from "../../components/ui";
import { SERVICES, BONUS } from "../../lib/constants";
import { prisma } from "../../lib/prisma";
import { DashboardClient } from "./ui";

export default async function DashboardPage() {
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

  // ✅ Ensure user exists in DB (fixes Google sign-in + prevents null user)
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
    where: { userId: user.id, status: "draft" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const ensured =
    order ||
    (await prisma.order.create({
      data: {
        userId: user.id,
        status: "draft",
        paymentLink: process.env.NEXT_PUBLIC_REVOLUT_LINK || "https://revolut.me/yourdummy",
        paymentProvider: "revolut",
      },
      include: { items: true },
    }));

  return (
    <div className="space-y-6">
      <SectionTitle title="Dashboard" subtitle="Select your service, share your details, and add to cart." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-white font-extrabold text-lg">Choose your service</h3>
            <p className="text-white/70 mt-1">All service details are based on your pricing plan.</p>
            <DashboardClient services={SERVICES} orderId={ensured.id} existingItems={ensured.items} />
            <div className="mt-4 glass rounded-xl p-4">
              <div className="text-white font-bold">{BONUS.title}</div>
              <div className="text-white/70 text-sm">{BONUS.subtitle}</div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-white font-extrabold text-lg">Live chat support</h3>
            <p className="text-white/70 mt-2">Chat with us for any queries.</p>
            <a
              className="btn-primary w-full mt-4"
              href={
                process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
                "https://api.whatsapp.com/send?phone=353000000000&text=Hi%20HOPE_IRL%20I%20need%20help"
              }
              target="_blank"
            >
              Open WhatsApp Chat
            </a>
            <div className="text-white/50 text-xs mt-2">Time: Available 24/7.</div>
          </Card>

          <Card>
            <h3 className="text-white font-extrabold text-lg">Next step</h3>
            <p className="text-white/70 mt-2">Go to cart to confirm your selections and submit payment reference.</p>
            <a className="btn-secondary w-full mt-4" href="/cart">
              Go to Cart
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
