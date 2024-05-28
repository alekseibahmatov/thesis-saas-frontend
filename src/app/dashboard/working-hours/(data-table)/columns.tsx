"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit2Icon, MoreHorizontal, Trash2Icon } from "lucide-react";
import type { DayOfWeek } from "@prisma/client";
import { useState } from "react";
import { WorkingHoursEditSheet } from "~/app/dashboard/working-hours/(components)/working-hours-edit-sheet";

export type WorkingHours = {
  companyId: string;
  id: string;
  name: string;
  workersAmount: number;
  dayOfWeek: DayOfWeek;
  from: string;
  until: string;
  isAssigned: boolean;
  workerId: string;
};

export const columns: ColumnDef<WorkingHours>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "workersAmount",
    header: "Workers Amount",
  },
  {
    accessorKey: "dayOfWeek",
    header: "Day of the week",
  },
  {
    accessorKey: "from",
    header: "Work from",
  },
  {
    accessorKey: "until",
    header: "Work until",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const w = row.original;

      const removeMutation = api.workingHourRouter.remove.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["workingHourRouter", "getAll"]);
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
                    removeMutation.mutate({
                      id: w.id,
                    })
                  }
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <WorkingHoursEditSheet
            companyId={w.companyId}
            id={w.id}
            name={w.name}
            dayOfWeek={w.dayOfWeek}
            from={w.from}
            until={w.until}
            sheetOpen={sheetOpen}
            setSheetOpen={setSheetOpen}
          />
        </>
      );
    },
  },
];
