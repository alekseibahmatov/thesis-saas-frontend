"use client";
import type { FC } from "react";
import { api } from "~/trpc/react";
import { CustomTable } from "~/components/custom-table";
import { columns } from "~/app/dashboard/company/[companyId]/(machine-table)/columns";

interface PageProps {
  companyId?: string;
}

export const MachinesTable: FC<PageProps> = ({ companyId }) => {
  const { data: machines } = api.machineRouter.getAll.useQuery({
    companyId,
  });

  if (!machines) {
    return "Loading...";
  }

  return <CustomTable columns={columns} data={machines} />;
};
