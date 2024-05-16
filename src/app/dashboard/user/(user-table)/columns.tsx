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
import type { UserRole } from "@prisma/client";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "fullName",
    header: "User Full Name",
  },
  {
    accessorKey: "role",
    header: "User Role",
    cell: ({ row }) => {
      const d = row.original;

      return <Badge>{d.role}</Badge>;
    },
  },
  {
    accessorKey: "email",
    header: "User Email",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const queryClient = useQueryClient();
      const d = row.original;

      const removeMutation = api.userRouter.removeUser.useMutation({
        onSuccess: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries(["userRouter", "getAll"]);
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
            <DropdownMenuItem>
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
