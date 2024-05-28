import {MachinesTable} from "~/app/dashboard/company/[companyId]/(components)/machines-table";
import {CreateMachineSheet} from "~/app/dashboard/company/[companyId]/(components)/create-machine-sheet";

export default function Page() {
return (
    <>
        <div className="flex justify-end">
            <CreateMachineSheet />
        </div>
        <MachinesTable />
    </>
)
}