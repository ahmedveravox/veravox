import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, businessName, businessType, dialect, tone, referralCode } =
      await req.json();

    if (!name || !email || !password || !businessName || !businessType) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "البريد مستخدم مسبقاً" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        referredBy: referralCode || null,
        business: {
          create: {
            name: businessName,
            type: businessType,
            dialect: dialect || "sa",
            tone: tone || "friendly",
            agents: {
              create: [
                { agentType: "sales", isActive: true },
              ],
            },
          },
        },
        subscription: {
          create: {
            plan: "trial",
            maxAgents: 1,
            status: "trial",
            trialEnds,
            renewsAt,
          },
        },
      },
    });

    // Track referral with tiered rewards
    if (referralCode) {
      const referrer = await db.user.findFirst({ where: { referralCode } });
      if (referrer) {
        const completedCount = await db.referral.count({
          where: { referrerId: referrer.id, status: "completed" },
        });
        // Tiered rewards: 1st=30, 2nd=50, 3rd=50 (2-3 avg 100-150 total), 4th+=79
        // Milestone bonus when reaching 5 or 10
        let reward = 30;
        if (completedCount >= 3) reward = 79;
        else if (completedCount >= 1) reward = 50;

        await db.referral.create({
          data: {
            referrerId: referrer.id,
            referredEmail: email,
            status: "completed",
            reward,
          },
        });
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
