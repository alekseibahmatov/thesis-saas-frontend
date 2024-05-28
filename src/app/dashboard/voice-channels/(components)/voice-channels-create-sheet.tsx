"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "~/trpc/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  voiceChannelsCreateScheme,
  type voiceChannelsCreateSchemeType,
} from "~/validators/voice-channel";

export const VoiceChannelsCreateSheet = () => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<voiceChannelsCreateSchemeType>({
    resolver: zodResolver(voiceChannelsCreateScheme),
  });

  const mutation = api.voiceChannelRouter.create.useMutation({
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

  const saveVoiceChannel: SubmitHandler<voiceChannelsCreateSchemeType> = (
    data,
  ) => {
    mutation.mutate(data);
  };

  return (
    <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
      <SheetTrigger>
        <Button variant="outline">Add new voice channel</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add new voice channel</SheetTitle>
          <SheetDescription>Add voice channel to a system</SheetDescription>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Managers" {...field} />
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
                Save voice channel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
