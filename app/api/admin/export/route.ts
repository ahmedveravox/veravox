import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAdmin();

  const users = await db.user.findMany({
    where: { isAdmin: false },
    orderBy: { createdAt: "desc" },
    include: {
      business: { select: { name: true, type: true, dialect: true } },
      subscription: { select: { plan: true, status: true, createdAt: true, renewsAt: true } },
      _count: { select: { conversations: true } },
    },
  });

  const PLAN_PRICES: Record<string, number> = {
    trial: 0, starter: 199, team: 299, growth: 499, business: 999,
  };

  const rows = [
    ["الاسم", "البريد", "اسم النشاط", "نوع النشاط", "الباقة", "حالة الاشتراك", "السعر الشهري", "المحادثات", "تاريخ التسجيل", "تجديد الاشتراك"].join(","),
    ...users.map(u => [
      `"${u.name}"`,
      u.email,
      `"${u.business?.name ?? ""}"`,
      `"${u.business?.type ?? ""}"`,
      u.subscription?.plan ?? "—",
      u.subscription?.status ?? "—",
      PLAN_PRICES[u.subscription?.plan ?? ""] ?? 0,
      u._count.conversations,
      new Date(u.createdAt).toLocaleDateString("ar-SA"),
      u.subscription?.renewsAt ? new Date(u.subscription.renewsAt).toLocaleDateString("ar-SA") : "—",
    ].join(",")),
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="tayf-clients-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
