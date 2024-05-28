import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserRole } from "@prisma/client";
import { type FC, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { userEditSchema, type userEditSchemaType } from "~/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";

interface PageProps {
  companyId?: string;
  id: string;
  fullName: string;
  role?: UserRole;
  email: string;
  showRole: boolean;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const EditUserSheet: FC<PageProps> = ({
  companyId,
  id,
  fullName,
  email,
  role,
  showRole,
  sheetOpen,
  setSheetOpen,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<userEditSchemaType>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      companyId,
      id,
      fullName,
      email,
      role,
    },
  });

  const isRoleAllowed = useMemo(() => showRole, [showRole]);

  const mutation = api.userRouter.edit.useMutation({
    onError: (err) => {
      setError(err.message);
    },
    onSuccess: () => {
      setSheetOpen(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      void queryClient.invalidateQueries([
        "userRouter",
        "getAll",
        "getUsersFilter",
      ]);
      form.reset();
    },
  });

  const saveUser: SubmitHandler<userEditSchemaType> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit {!isRoleAllowed ? "worker" : "user"}</SheetTitle>
          <SheetDescription>Edit user in the system</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveUser)}>
            <div className="grid gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                name="fullName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Toomas Saas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="toomas@saas.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isRoleAllowed && (
                <FormField
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={role}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select user role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(UserRole).map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                Update user
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
