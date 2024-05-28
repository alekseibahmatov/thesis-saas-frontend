'use client'
import {CreateUserSheet} from "~/app/dashboard/user/(components)/create-user-sheet";
import {UserRole} from "@prisma/client";
import {CustomTable} from "~/components/custom-table";
import {columns} from "~/app/dashboard/user/(user-table)/columns";
import {api} from "~/trpc/react";

export default function Page() {
    const {data, isLoading} = api.userRouter.getUsersFilter.useQuery({userRole: UserRole.WORKER})

    if (isLoading) {
        return "Loading...";
    }

    return (
        <>
            <div className="flex justify-end">
                <CreateUserSheet showRole={false} />
            </div>
            <CustomTable columns={columns} data={data} />
        </>
    )
}