"use client";

import type { FC } from "react";
import { CustomTable } from "~/components/custom-table";
import { columns } from "~/app/dashboard/user/[userId]/(user-working-hour-table)/columns";
import { api } from "~/trpc/react";

interface PageProps {
  userId: string;
}

export const UserWorkingHourTable: FC<PageProps> = ({ userId }) => {
  const { data, isLoading } = api.workingHourRouter.getAll.useQuery({
    workerId: userId,
  });

  if (isLoading) {
    return "Loading...";
  }

  return <CustomTable columns={columns} data={data ?? []} />;
};
