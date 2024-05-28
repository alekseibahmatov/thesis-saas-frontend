"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  CaretSortIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { companyCreateSchemaType } from "~/validators/company";
import { companyCreateSchema } from "~/validators/company";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { UserRole } from "@prisma/client";

export const CreateCompanySheet = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: managers } = api.userRouter.getUsersFilter.useQuery({
    userRole: UserRole.MANAGER,
  });
  const form = useForm<companyCreateSchemaType>({
    resolver: zodResolver(companyCreateSchema),
  });

  const mutation = api.companyRouter.createCompany.useMutation({
    onError: (err) => {
      setError(err.message);
    },
    onSuccess: () => {
      setSheetOpen(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      void queryClient.invalidateQueries(["companyRouter", "getAll"]);
      form.reset();
    },
  });

  const saveCompany: SubmitHandler<companyCreateSchemaType> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
      <SheetTrigger>
        <Button variant="outline">Add new company</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add new company</SheetTitle>
          <SheetDescription>Add new company to a system</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveCompany)}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                name="companyName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Saas OÜ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="userId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Manager</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value && !!managers
                              ? managers.find(({ id }) => id === field.value)
                                  ?.fullName
                              : "Select user"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search user..."
                            className="h-9"
                          />
                          <CommandEmpty>No users found.</CommandEmpty>
                          <CommandGroup>
                            <CommandList>
                              {!!managers &&
                                managers.map(({ id, fullName, email }) => (
                                  <CommandItem
                                    value={fullName}
                                    key={id}
                                    onSelect={() => {
                                      form.setValue("userId", id);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      {fullName}
                                      <p className="text-muted-foreground">
                                        {email}
                                      </p>
                                    </div>
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        id === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                            </CommandList>
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="mt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save company
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
