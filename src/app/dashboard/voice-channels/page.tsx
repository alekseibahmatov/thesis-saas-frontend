"use client";

import { CustomTable } from "~/components/custom-table";
import { columns } from "~/app/dashboard/voice-channels/(voice-channels-table)/columns";
import { VoiceChannelsCreateSheet } from "~/app/dashboard/voice-channels/(components)/voice-channels-create-sheet";
import { api } from "~/trpc/react";

export default function Page() {
  const { data, isLoading } = api.voiceChannelRouter.getAll.useQuery({});

  if (isLoading) {
    return "...Loading";
  }

  return (
    <>
      <div className="flex justify-end">
        <VoiceChannelsCreateSheet />
      </div>
      <CustomTable columns={columns} data={data ?? []} />
    </>
  );
}
