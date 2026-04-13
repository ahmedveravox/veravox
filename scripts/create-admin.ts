/**
 * سكريبت لإنشاء أول مدير للمنصة
 * الاستخدام: npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@tayf.ai";
  const password = process.env.ADMIN_PASSWORD || "admin123456";
  const name = process.env.ADMIN_NAME || "مدير المنصة";

  // تحقق هل المستخدم موجود
  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    // اجعله مدير إذا لم يكن كذلك
    if (!existing.isAdmin) {
      await db.user.update({ where: { email }, data: { isAdmin: true } });
      console.log(`✓ تم منح صلاحيات المدير للمستخدم: ${email}`);
    } else {
      console.log(`ℹ️  المستخدم ${email} هو مدير بالفعل`);
    }
    return;
  }

  // إنشاء مستخدم جديد
  const passwordHash = await bcrypt.hash(password, 12);
  const trialEnds = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // سنة كاملة

  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      isAdmin: true,
      referralCode: `admin-${Date.now()}`,
      subscription: {
        create: {
          plan: "business",
          maxAgents: 10,
          status: "active",
          trialEnds,
          renewsAt: trialEnds,
        },
      },
    },
  });

  console.log("✓ تم إنشاء حساب المدير بنجاح:");
  console.log(`  البريد: ${email}`);
  console.log(`  كلمة المرور: ${password}`);
  console.log(`  المعرّف: ${user.id}`);
  console.log("\n⚠️  غيّر كلمة المرور فور تسجيل الدخول!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
