"use client";

import { api } from "~/trpc/react";
import { CustomTable } from "~/components/custom-table";
import { columns } from "~/app/dashboard/user/[userId]/(user-voice-channels-table)/columns";
import type { FC } from "react";

interface PageProps {
  userId: string;
}

export const UserVoiceChannelsTable: FC<PageProps> = ({ userId }) => {
  const { data, isLoading } = api.voiceChannelRouter.getAll.useQuery({
    workerId: userId,
  });

  if (isLoading) {
    return "Loading...";
  }

  return <CustomTable columns={columns} data={data ?? []} />;
};
