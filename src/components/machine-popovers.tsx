"use client";

import { api } from "~/trpc/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";
import { Text } from "@react-email/components";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export const MachinePopovers = () => {
  const queryClient = useQueryClient();
  const socket = io("ws://127.0.0.1:3330");
  const { data } = api.machineRouter.getAll.useQuery({});

  const mutation = api.machineRouter.moveMachine.useMutation();

  const handleStop = (
    e: DraggableEvent,
    data: DraggableData,
    machineId: string,
  ) => {
    // Update machine position in the database
    mutation.mutate({
      id: machineId,
      positionX: data.x,
      positionY: data.y,
    });
  };

  useEffect(() => {
    socket.on("alert", () => {
      void queryClient.invalidateQueries(["machineRouter", "getAll"]);
    });
  }, []);

  return (
    <>
      {!!data &&
        data.map((machine) => (
          <div key={machine.name} className="h-10 w-10">
            <Draggable
              defaultPosition={{
                x: machine.positionX ?? 0,
                y: machine.positionY ?? 0,
              }}
              onStop={(e, data) => handleStop(e, data, machine.id)}
            >
              <div>
                <Popover>
                  <PopoverTrigger>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black bg-opacity-50">
                      <div
                        className={`h-3 w-3 rounded-full ${machine.status === "Issue" ? "bg-red-400" : "bg-green-400"}`}
                      ></div>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Text className="!my-0">
                      Status: {machine.status}
                      <br />
                      Machine Name: {machine.name}
                      <br />
                      Machine Dock IP: {machine.dockIp}
                    </Text>
                  </PopoverContent>
                </Popover>
              </div>
            </Draggable>
          </div>
        ))}
    </>
  );
};
