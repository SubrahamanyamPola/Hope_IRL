import Link from "next/link";
import { requireUser } from "../../../lib/requireAuth";
import { prisma } from "../../../lib/prisma";
import { Card, SectionTitle } from "../../../components/ui";

function stepIndex(status) {
  const steps = ["awaiting_payment", "payment_submitted", "paid", "in_progress", "completed"];
  const i = steps.indexOf(status);
  return i >= 0 ? i : 0;
}

export default async function OrderStatusPage({ params }) {
  const session = await requireUser();
  const user = await prisma.user.findUnique({ where: { email: session.user.email }});

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, consultant: true, notes: { orderBy: { createdAt: "desc" } } }
  });

  if (!order || order.userId !== user.id) {
    return (
      <Card>
        <div className="text-white/70">Order not found.</div>
        <div className="mt-4"><Link className="btn-primary" href="/orders">Back</Link></div>
      </Card>
    );
  }

  const steps = [
    { key: "awaiting_payment", label: "Awaiting payment" },
    { key: "payment_submitted", label: "Payment submitted" },
    { key: "paid", label: "Paid" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" }
  ];
  const active = stepIndex(order.status);

  return (
    <div className="space-y-6">
      <SectionTitle title="Order Status" subtitle="Clear progress tracking for your service request." />

      <Card>
        <div className="text-white font-extrabold">Order ID</div>
        <div className="text-white/70 text-sm mt-1">{order.id}</div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-white/60 text-sm">Assigned consultant</div>
            <div className="text-white font-extrabold mt-1">{order.consultant?.name || "Not assigned yet"}</div>
            <div className="text-white/70 text-sm mt-1">{order.consultant?.email || ""}</div>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="text-white/60 text-sm">Total</div>
            <div className="text-white font-extrabold mt-1">€{(order.totalCents/100).toFixed(0)}</div>
            <div className="text-white/70 text-sm mt-1">Status: {order.status}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-white font-extrabold">Progress</div>
          <div className="mt-3 grid md:grid-cols-5 gap-2">
            {steps.map((s, idx) => (
              <div key={s.key} className={`rounded-xl p-3 border ${
                idx <= active ? "border-sky-300/30 bg-sky-400/10" : "border-white/10 bg-white/5"
              }`}>
                <div className={`text-sm font-semibold ${idx <= active ? "text-sky-200" : "text-white/60"}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-white font-extrabold">Services</div>
          <ul className="mt-2 text-white/70 list-disc pl-5 space-y-1">
            {order.items.map((it) => <li key={it.id}>{it.title}</li>)}
          </ul>
        </div>

        <div className="mt-6">
          <div className="text-white font-extrabold">Updates from HOPE_IRL</div>
          <div className="text-white/60 text-sm mt-1">Notes are visible when our team adds updates.</div>

          <div className="mt-3 space-y-2">
            {order.notes.length ? order.notes.slice(0, 5).map((n) => (
              <div key={n.id} className="glass rounded-xl p-4">
                <div className="text-white/70 text-sm">{new Date(n.createdAt).toLocaleString()}</div>
                <div className="text-white mt-1">{n.content}</div>
              </div>
            )) : (
              <div className="text-white/50 text-sm mt-2">No notes yet.</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <Link className="btn-secondary" href="/orders">Back to orders</Link>
          <Link
            className="btn-primary"
            href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://api.whatsapp.com/send?phone=353000000000&text=Hi%20HOPE_IRL%20I%20need%20help"}
            target="_blank"
          >
            Live chat support
          </Link>
        </div>
      </Card>
    </div>
  );
}
