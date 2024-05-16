import type { UserRole } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export const pathGuard = async (userRoles: UserRole[]) => {
  const session = await getServerAuthSession();

  if (session && userRoles.length === 0) redirect("/dashboard");

  if (!session || !userRoles.includes(session.user.role)) {
    redirect("/login");
  }
};
