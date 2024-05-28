"use client";

import { CustomTable } from "~/components/custom-table";
import { columns } from "~/app/dashboard/company/(data-table)/columns";
import { CreateCompanySheet } from "~/app/dashboard/company/(components)/create-company-sheet";
import { api } from "~/trpc/react";
import { pathGuard } from "~/utils/utils";
import { UserRole } from "@prisma/client";
import {useSession} from "next-auth/react";

export default function Companies() {
  const { data, isLoading } = api.companyRouter.getAll.useQuery();
  const session = useSession();

  if (isLoading) {
    return "Loading...";
  }

  console.log(session)

  return (
    <>
      <div className="flex justify-end">
        <CreateCompanySheet />
      </div>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <CustomTable columns={columns} data={data} />
    </>
  );
}
