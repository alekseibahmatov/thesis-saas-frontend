import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@saas.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@saas.com",
      password: await argon2.hash("123456"),
      role: UserRole.ADMIN,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
