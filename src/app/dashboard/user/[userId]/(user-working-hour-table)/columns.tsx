import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { type WorkingHours } from "~/app/dashboard/working-hours/(data-table)/columns";
import { Badge } from "~/components/ui/badge";

// export type WorkingHours = {
//   id: string;
//   name: string;
//   dayOfWeek: DayOfWeek;
//   from: string;
//   until: string;
//   amountAssigned: number;
//   companyId: string;
//   isAssigned: boolean;
//   workerId: string;
// };

export const columns: ColumnDef<WorkingHours>[] = [
  {
    accessorKey: "name",
    header: "Working Hour Name",
  },
  {
    accessorKey: "workersAmount",
    header: "Amount Workers Assigned",
  },
  {
    accessorKey: "dayOfWeek",
    header: "Day of week",
    cell: ({ row }) => <Badge>{row.original.dayOfWeek}</Badge>,
  },
  {
    accessorKey: "from",
    header: "Work starts",
  },
  {
    accessorKey: "until",
    header: "Work ends",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const wh = row.original;

      const queryClient = useQueryClient();

      const mutation = api.workingHourRouter.assignUnassignUser.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["workingHourRouter", "getAll"]);
        },
      });

      return (
        <Button
          onClick={() =>
            mutation.mutate({
              id: wh.id,
              workerId: wh.workerId,
              companyId: wh.companyId,
            })
          }
        >
          {wh.isAssigned ? "Unassign" : "Assign"}
        </Button>
      );
    },
  },
];
