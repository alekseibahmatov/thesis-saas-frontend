"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { type VoiceChannels } from "~/app/dashboard/user/[userId]/(user-voice-channels-table)/columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Edit2Icon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { VoiceChannelEditSheet } from "~/app/dashboard/voice-channels/(components)/voice-channel-edit-sheet";

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

      const mutation = api.voiceChannelRouter.remove.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["voiceChannelRouter", "getAll"]);
        },
      });

      const [sheetOpen, setSheetOpen] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSheetOpen(true)}>
                <div className="flex flex-row items-center">
                  <Edit2Icon className="mr-2 h-4 w-4" />
                  Edit
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  className="flex flex-row items-center text-red-600"
                  onClick={() =>
                    mutation.mutate({
                      id: vc.id,
                    })
                  }
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <VoiceChannelEditSheet
            id={vc.id}
            companyId={vc.companyId}
            name={vc.name}
            sheetOpen={sheetOpen}
            setSheetOpen={setSheetOpen}
          />
        </>
      );
    },
  },
];
