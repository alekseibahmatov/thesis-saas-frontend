"use client";

import { api } from "~/trpc/react";
import { UploadFactoryPlanImage } from "~/components/upload-factory-plan-image";
import { FactoryPlanImage } from "~/components/factory-plan-image";

export default function Home() {
  const { data, isLoading } = api.companyRouter.isFactoryPlan.useQuery();

  return (
    <>
      {isLoading || !data?.isFactoryPlan ? (
        <UploadFactoryPlanImage />
      ) : (
        <FactoryPlanImage />
      )}
    </>
  );
}
