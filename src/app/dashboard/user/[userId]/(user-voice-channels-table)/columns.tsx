"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export type VoiceChannels = {
  id: string;
  name: string;
  amountAssigned: number;
  companyId: string;
  isAssigned: boolean;
  workerId: string;
};

export const columns: ColumnDef<VoiceChannels>[] = [
  {
    accessorKey: "name",
    header: "Voice Channel Name",
  },
  {
    accessorKey: "amountAssigned",
    header: "Amount Workers Assigned",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const vc = row.original;

      const queryClient = useQueryClient();

      const mutation = api.voiceChannelRouter.assignUnassignUser.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["voiceChannelRouter", "getAll"]);
        },
      });

      return (
        <Button
          onClick={() =>
            mutation.mutate({
              id: vc.id,
              workerId: vc.workerId,
              companyId: vc.companyId,
            })
          }
        >
          {vc.isAssigned ? "Unassign" : "Assign"}
        </Button>
      );
    },
  },
];
