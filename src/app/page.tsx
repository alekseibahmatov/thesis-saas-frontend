import { pathGuard } from "~/utils/utils";

export default async function Page() {
  await pathGuard([]);
  return;
}
