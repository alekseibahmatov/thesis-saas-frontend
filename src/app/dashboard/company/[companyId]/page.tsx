import { MachinesTable } from "~/app/dashboard/company/[companyId]/(components)/machines-table";
import { CompanyEditCard } from "~/app/dashboard/company/[companyId]/(components)/company-edit-card";
import { CompanyUserTable } from "~/app/dashboard/company/[companyId]/(components)/company-user-table";

export default async function Page({
  params,
}: {
  params: { companyId: string };
}) {
  const { companyId } = params;

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <CompanyEditCard companyId={companyId} />
          </div>
          <div className="col-span-3">
            <div className="flex flex-col gap-4">
              <MachinesTable companyId={companyId} />
              <CompanyUserTable companyId={companyId} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
