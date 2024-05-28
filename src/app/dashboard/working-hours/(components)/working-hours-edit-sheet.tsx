import { DayOfWeek } from "@prisma/client";
import { type FC, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import {
  workingHourEditSchema,
  type workingHourEditSchemaType,
} from "~/validators/working-hour";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

interface PageProps {
  companyId: string;
  id: string;
  name: string;
  dayOfWeek: DayOfWeek;
  from: string;
  until: string;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const WorkingHoursEditSheet: FC<PageProps> = ({
  companyId,
  id,
  name,
  dayOfWeek,
  from,
  until,
  sheetOpen,
  setSheetOpen,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<workingHourEditSchemaType>({
    resolver: zodResolver(workingHourEditSchema),
    defaultValues: {
      companyId,
      id,
      name,
      dayOfWeek,
      from,
      until,
    },
  });

  const times = useMemo(() => {
    const times = [];

    for (let hours = 0; hours < 24; hours++) {
      for (let minuteMagnifier = 0; minuteMagnifier < 4; minuteMagnifier++) {
        times.push(
          `${hours <= 9 ? "0" + hours : hours}:${minuteMagnifier === 0 ? "00" : 15 * minuteMagnifier}`,
        );
      }
    }
    return times;
  }, []);

  const mutation = api.workingHourRouter.edit.useMutation({
    onError: (err) => {
      setError(err.message);
    },
    onSuccess: () => {
      setSheetOpen(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      void queryClient.invalidateQueries(["workingHourRouter", "getAll"]);
      form.reset();
    },
  });

  const editWorkingHours: SubmitHandler<workingHourEditSchemaType> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit working hour</SheetTitle>
          <SheetDescription>Edit working hour in the company</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(editWorkingHours)}>
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
                      <Input placeholder="Monday 12:00-14:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="dayOfWeek"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={dayOfWeek}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day of week" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(DayOfWeek).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="from"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work starts</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={from}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {times.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                name="until"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work ends</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={until}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {times.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save working time
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
