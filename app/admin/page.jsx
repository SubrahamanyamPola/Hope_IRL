import { requireAdmin } from "../../lib/requireAuth";
import { prisma } from "../../lib/prisma";
import { Card, SectionTitle } from "../../components/ui";
import Link from "next/link";

export default async function AdminPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    where: { status: { in: ["awaiting_payment","payment_submitted","paid","in_progress","completed"] } },
    include: { user: true, items: true, consultant: true, notes: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <SectionTitle title="Admin Dashboard" subtitle="View all customer submissions and export to Excel (CSV)." />

      <div className="flex flex-col md:flex-row gap-3">
        <a className="btn-primary" href="/api/admin/export" target="_blank">Export CSV (Excel)</a>
      </div>

      <div className="grid gap-4">
        {orders.length ? orders.map((o) => (
          <Card key={o.id} className="p-0 overflow-hidden">
            <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-white font-extrabold truncate">
                  {o.fullName || o.user?.name || "Unnamed"} • <span className="text-white/60 text-sm">{o.user?.email}</span>
                </div>
                <div className="text-white/60 text-sm mt-1">
                  Phone: {o.phone || o.user?.phone || "—"} • LinkedIn: {o.linkedinUrl || o.user?.linkedinUrl || "—"} • Consultant: {o.consultant?.name || "—"}
                </div>
                <div className="text-white/60 text-sm mt-1">
                  Status: <span className="text-sky-200 font-semibold">{o.status}</span> • Total: €{(o.totalCents/100).toFixed(0)} • Notes: {o.notes.length}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.items.map((it) => (
                    <span key={it.id} className="badge border-white/15 text-white/70 bg-white/5">{it.title}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {o.resumeFileUrl ? (
                  <Link className="btn-secondary" href={o.resumeFileUrl} target="_blank">Download Resume</Link>
                ) : (
                  <div className="text-white/40 text-sm">No resume uploaded</div>
                )}
                <Link className="btn-primary" href={`/admin/orders/${o.id}`}>Open</Link>
              </div>
            </div>
          </Card>
        )) : (
          <Card>
            <div className="text-white/70">No submissions yet.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
