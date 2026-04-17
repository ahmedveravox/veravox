import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import BroadcastClient from "./broadcast-client";

export const metadata = { title: "الإعلانات – Admin" };

export default async function BroadcastPage() {
  await requireAdmin();

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const userCounts = await Promise.all([
    db.user.count({ where: { isAdmin: false } }),
    db.subscription.count({ where: { status: "trial" } }),
    db.subscription.count({ where: { status: "active" } }),
  ]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>📢 الإعلانات والبث</h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>أرسل إعلانات لعملائك</p>
      </div>

      <BroadcastClient
        announcements={announcements}
        totalUsers={userCounts[0]}
        trialUsers={userCounts[1]}
        activeUsers={userCounts[2]}
      />
    </div>
  );
}
