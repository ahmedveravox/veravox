import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ReferralClient from "./referral-client";

export default async function ReferralPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      referrals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  const totalReward = user.referrals.filter(r => r.status === "completed").reduce((sum, r) => sum + r.reward, 0);
  const referralUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/register?ref=${user.referralCode}`;

  return (
    <ReferralClient
      referralCode={user.referralCode}
      referralUrl={referralUrl}
      referrals={user.referrals}
      totalReward={totalReward}
    />
  );
}
