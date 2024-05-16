import { FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  machineCreateSchemeType,
  machineEditScheme,
  machineEditSchemeType,
} from "~/validators/machine";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Input } from "~/components/ui/input";

interface PageProps {
  companyId: string;
  machineId: string;
  machineName: string;
  machineDockIp: string;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const EditMachineSheet: FC<PageProps> = ({
  companyId,
  machineId,
  machineName,
  machineDockIp,
  sheetOpen,
  setSheetOpen,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<machineEditSchemeType>({
    resolver: zodResolver(machineEditScheme),
    defaultValues: {
      companyId,
      machineId,
      name: machineName,
      dockIp: machineDockIp,
    },
  });

  const mutation = api.machineRouter.editMachine.useMutation({
    onError: (err) => {
      setError(err.message);
    },
    onSuccess: () => {
      setSheetOpen(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      void queryClient.invalidateQueries(["machineRouter", "getAll"]);
      form.reset();
    },
  });

  const editMachine: SubmitHandler<machineCreateSchemeType> = (data) => {
    mutation.mutate({ ...data, companyId });
  };

  return (
    <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit {machineName}</SheetTitle>
          <SheetDescription>Edit existing machine</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(editMachine)}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Machine #1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="dockIp"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dock IP</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save machine
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
