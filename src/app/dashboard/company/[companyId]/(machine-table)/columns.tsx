"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit2Icon, MoreHorizontal, Trash2Icon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import { EditMachineSheet } from "~/app/dashboard/company/[companyId]/(components)/edit-machine-sheet";
import { useState } from "react";

export type Machine = {
  id: string;
  name: string;
  dockIp: string;
  status: string; //TODO change to some enum
  companyId: string;
};

export const columns: ColumnDef<Machine>[] = [
  {
    accessorKey: "name",
    header: "Machine Name",
  },
  {
    accessorKey: "dockIp",
    header: "Dock IP",
  },
  {
    accessorKey: "status",
    header: "Machine Status",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <Badge variant={s.status === "Issue" ? "destructive" : "success"}>
          {s.status}
        </Badge>
      );
    },
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const m = row.original;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queryClient = useQueryClient();

      const deleteMutation = api.machineRouter.removeMachine.useMutation({
        onSuccess: () => {
          // @ts-expect-error Expected error
          void queryClient.invalidateQueries(["machineRouter", "getAll"]);
        },
      });

      // eslint-disable-next-line react-hooks/rules-of-hooks
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
              <DropdownMenuItem
                onClick={() =>
                  deleteMutation.mutate({
                    machineId: m.id,
                  })
                }
              >
                <div className="flex flex-row items-center text-red-600">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditMachineSheet
            companyId={m.companyId}
            machineId={m.id}
            machineName={m.name}
            machineDockIp={m.dockIp}
            setSheetOpen={setSheetOpen}
            sheetOpen={sheetOpen}
          />
        </>
      );
    },
  },
];
