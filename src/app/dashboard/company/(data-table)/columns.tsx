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
import { MoreHorizontal, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/trpc/react";

export type Company = {
  id: string;
  name: string;
  workersAmount: number;
  managerName: string;
};

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
  },
  {
    accessorKey: "workersAmount",
    header: "Workers Amount",
  },
  {
    accessorKey: "managerName",
    header: "Manager Name",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const d = row.original;

      const removeMutation = api.companyRouter.removeCompany.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["companyRouter", "getAll"]);
        },
      });
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/dashboard/company/${d.id}`}>
              <DropdownMenuItem>View company</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <div
                className="flex flex-row items-center text-red-600"
                onClick={() =>
                  removeMutation.mutate({
                    id: d.id,
                  })
                }
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
