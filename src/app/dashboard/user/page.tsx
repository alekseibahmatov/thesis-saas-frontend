"use client";
import {CustomTable} from "~/components/custom-table";
import {columns} from "~/app/dashboard/user/(user-table)/columns";
import {CreateUserSheet} from "~/app/dashboard/user/(components)/create-user-sheet";
import {api} from "~/trpc/react";

export default function Page() {
  const { data, isLoading } = api.userRouter.getAll.useQuery();

  if (isLoading) {
    return "...Loading";
  }

  return (
    <>
      <div className="flex justify-end">
        <CreateUserSheet showRole={true} />
      </div>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error */}
      <CustomTable columns={columns} data={data} />
    </>
  );
}
