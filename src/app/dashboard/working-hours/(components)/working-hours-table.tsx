'use client';
import {CustomTable} from "~/components/custom-table";
import {columns} from "~/app/dashboard/working-hours/(data-table)/columns";
import {api} from "~/trpc/react";
import {WorkingHoursCreateSheet} from "~/app/dashboard/working-hours/(components)/working-hours-create-sheet";

export const WorkingHoursTable = () => {
    const {data, isLoading} = api.workingHourRouter.getAll.useQuery({})

    if (isLoading) {
        return "Loading..."
    }

    return <>
        <div className="flex justify-end">
            <WorkingHoursCreateSheet />
        </div>
        <CustomTable columns={columns} data={data ?? []}/>
    </>
}