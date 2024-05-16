import { UserRole } from "@prisma/client";
import { pathGuard } from "~/utils/utils";

export default async function Home() {
  await pathGuard([UserRole.ADMIN, UserRole.MANAGER]);
  return <></>;
}
