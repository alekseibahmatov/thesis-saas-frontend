"use client";

import { CustomTable } from "~/components/custom-table";
import type { FC } from "react";
import { columns } from "~/app/dashboard/user/(user-table)/columns";
import { api } from "~/trpc/react";
import { UserRole } from "@prisma/client";
interface PageProps {
  companyId: string;
}
export const CompanyUserTable: FC<PageProps> = ({ companyId }) => {
  const { data, isLoading } = api.userRouter.getUsersFilter.useQuery({
    companyId,
    userRole: UserRole.WORKER,
  });

  if (isLoading) {
    return "Loading...";
  }

  //@ts-expect-error Might not have data
  return <CustomTable columns={columns} data={data} />;
};
