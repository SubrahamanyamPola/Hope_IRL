import { requireAdmin } from "../../../../lib/requireAuth";
import { prisma } from "../../../../lib/prisma";
import { Card, SectionTitle } from "../../../../components/ui";
import { AdminOrderClient } from "./ui";

export default async function AdminOrderPage({ params }) {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: true, items: true, consultant: true, notes: { include: { author: true }, orderBy: { createdAt: "desc" } } }
  });

  const consultants = await prisma.consultant.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <SectionTitle title="Order details" subtitle="Verify payment and manage the customer request." />
      <Card>
        <AdminOrderClient order={order} consultants={consultants} />
      </Card>
    </div>
  );
}
