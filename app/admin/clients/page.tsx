import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";
import AdminClientsTable from "./clients-table";

export const metadata = { title: "العملاء – Admin Tayf" };

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const page = parseInt(sp.page ?? "1");
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const where: Record<string, unknown> = { isAdmin: false };
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { email: { contains: sp.q } },
      { business: { name: { contains: sp.q } } },
    ];
  }
  if (sp.status) where.status = sp.status;
  if (sp.plan) {
    where.subscription = { plan: sp.plan };
  }

  const [clients, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        business: { select: { name: true, type: true }, },
        subscription: { select: { plan: true, status: true, trialEnds: true, renewsAt: true } },
        _count: { select: { conversations: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminClientsTable
      clients={clients}
      total={total}
      page={page}
      totalPages={totalPages}
      filters={{ q: sp.q, plan: sp.plan, status: sp.status }}
    />
  );
}
