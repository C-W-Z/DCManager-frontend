"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { APIError, SimpleRoom, Room, room_schema } from "@/lib/type";
import { getDC, getRoom, modifyRoom } from "@/lib/api";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MAX_HEIGHT } from "@/lib/constant";

export function EditRoomDialog({
  room,
  onUpdateSuccess,
}: {
  room: SimpleRoom;
  onUpdateSuccess?: (updatedRoom: SimpleRoom) => void;
}) {
  const [open, setOpen] = useState(false);
  const [constraints, setConstraints] = useState<{ min: number; max: number }>({
    min: 42,
    max: MAX_HEIGHT,
  });

  const form_schema = room_schema
    .pick({
      name: true,
      height: true,
    })
    .extend({
      height: z.coerce.number().int(),
    });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: room.name,
      height: room.height,
    },
  });

  const getHighestRackHeight = (room: Room) => {
    let max = 0;
    for (const rack of room.racks) {
      if (rack.height > max) {
        max = rack.height;
      }
    }
    return max;
  };

  const getDCHeight = async (dc_name: string) => {
    try {
      const dc = await getDC(dc_name);
      return dc.height;
    } catch (e) {
      console.error("Failed to fetch DC height:", e);
      return MAX_HEIGHT; // Default value if fetching fails
    }
  };

  const getConstrains = useCallback(async (simple_room: SimpleRoom) => {
    try {
      const dcHeight = await getDCHeight(simple_room.dc_name);
      const room = await getRoom(simple_room.name);
      const highestRackHeight = getHighestRackHeight(room);
      setConstraints({
        min: highestRackHeight,
        max: dcHeight,
      });
    } catch (e) {
      console.error("Failed to get constraints:", e);
    }
  }, [])

  useEffect(() => {
    if (!room) return;
    setOpen(true);
    getConstrains(room);
  }, [getConstrains, room]);

  function onSubmit(values: z.infer<typeof form_schema>) {
    modifyRoom(room.name, {
      name: values.name,
      height: values.height,
    })
      .then(() => {
        toast.success(`Room ${values.name} updated successfully`);
        form.reset();

        if (onUpdateSuccess) {
          // Create a new SimpleRoom object to pass to the callback
          const updatedRoom: SimpleRoom = {
            ...room,
            name: values.name,
            height: values.height,
          };
          onUpdateSuccess(updatedRoom);
        }
        setOpen(false);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Room
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Room-103" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="42"
                      min={constraints.min}
                      max={constraints.max}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Edit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
