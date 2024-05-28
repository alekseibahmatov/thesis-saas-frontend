"use client";

import { FC, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyCreateSchema,
  companyEditSchemaType,
} from "~/validators/company";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { CaretSortIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { api } from "~/trpc/react";
import { useToast } from "~/components/ui/use-toast";
import { CreateMachineSheet } from "~/app/dashboard/company/[companyId]/(components)/create-machine-sheet";
import { UserRole } from "@prisma/client";
import { CreateUserSheet } from "~/app/dashboard/user/(components)/create-user-sheet";

interface PageProps {
  companyId: string;
}

export const CompanyEditCard: FC<PageProps> = ({ companyId }) => {
  const { toast } = useToast();

  const { data: managers } = api.userRouter.getUsersFilter.useQuery({
    companyId,
    userRole: UserRole.MANAGER,
  });
  const { data: companyData } = api.companyRouter.getData.useQuery({
    id: companyId,
  });

  const form = useForm<companyEditSchemaType>({
    resolver: zodResolver(companyCreateSchema),
  });

  useEffect(() => {
    if (!companyData) return;
    form.setValue("companyName", companyData.name);
    form.setValue("userId", companyData.representativeId);
  }, [companyData, form, companyId]);

  const editMutation = api.companyRouter.editCompany.useMutation({
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Success!!!",
        description: "Company was successfully edited",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company edit was not successful",
      });
    },
  });

  const submitEdit: SubmitHandler<companyEditSchemaType> = (data) => {
    editMutation.mutate({
      ...data,
      companyId,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit company</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitEdit)}>
          <CardContent className="pb-2">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
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
              <Button
                type="submit"
                disabled={editMutation.isPending}
                className="mt-4"
              >
                {editMutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save company
              </Button>
            </div>
          </CardContent>
        </form>
      </Form>
      <CardFooter>
        <div className="flex flex-row flex-wrap gap-3">
          <CreateMachineSheet companyId={companyId} />
          <CreateUserSheet companyId={companyId} showRole={false} />
        </div>
      </CardFooter>
    </Card>
  );
};
