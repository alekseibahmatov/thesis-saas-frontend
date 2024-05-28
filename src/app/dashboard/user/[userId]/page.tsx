"use client";

import { UserVoiceChannelsTable } from "~/app/dashboard/user/[userId]/(components)/user-voice-channels-table";
import { UserWorkingHourTable } from "~/app/dashboard/user/[userId]/(components)/user-working-hour-table";

export default function Page({ params }: { params: { userId: string } }) {
  const { userId } = params;
  return (
    <>
      <UserVoiceChannelsTable userId={userId} />
      <UserWorkingHourTable userId={userId} />
    </>
  );
}
