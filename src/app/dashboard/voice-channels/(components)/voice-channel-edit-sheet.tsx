import { type FC, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { userEditSchema, userEditSchemaType } from "~/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  voiceChannelsEditScheme,
  type voiceChannelsEditSchemeType,
} from "~/validators/voice-channel";
import { api } from "~/trpc/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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
import { Button } from "~/components/ui/button";

interface PageProps {
  id: string;
  companyId: string;
  name: string;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

export const VoiceChannelEditSheet: FC<PageProps> = ({
  id,
  companyId,
  name,
  sheetOpen,
  setSheetOpen,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<voiceChannelsEditSchemeType>({
    resolver: zodResolver(voiceChannelsEditScheme),
    defaultValues: {
      companyId,
      id,
      name,
    },
  });

  const mutation = api.voiceChannelRouter.edit.useMutation({
    onError: (err) => {
      setError(err.message);
    },
    onSuccess: () => {
      setSheetOpen(false);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      void queryClient.invalidateQueries(["voiceChannelRouter", "getAll"]);
      form.reset();
    },
  });

  const saveVoiceChannel: SubmitHandler<voiceChannelsEditSchemeType> = (
    data,
  ) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit voice channel</SheetTitle>
          <SheetDescription>Edit voice channel in the system</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveVoiceChannel)}>
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Voice channel name" {...field} />
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
                Update voice channel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
