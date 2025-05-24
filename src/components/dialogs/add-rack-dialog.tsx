"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Rack, rack_schema, SimpleRoom } from "@/lib/type";
import { toast } from "sonner";
import { addRack } from "@/lib/api";
import { Plus } from "lucide-react";

export function AddRackDialog({
  currentRoom,
  onSuccess,
}: {
  currentRoom: SimpleRoom;
  onSuccess?: (newRack: Rack) => void;
}) {
  const [open, setOpen] = useState(false);

  const form_schema = rack_schema
    .pick({
      name: true,
      height: true,
    })
    .extend({
      height: z.coerce.number().int().min(42).max(currentRoom.height),
    });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: "",
      height: 42,
    },
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addRack({
      name: values.name,
      height: values.height,
      room_name: currentRoom.name,
    })
      .then((newRack) => {
        setOpen(false);
        toast.success(`Rack ${values.name} added successfully`);
        form.reset();
        onSuccess?.(newRack);
      })
      .catch((error) => {
        toast.error(`Failed to add rack: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>New Rack</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Rack</DialogTitle>
          <DialogDescription>
            Add a new rack to current position:
            <br />
            {currentRoom.dc_name}/{currentRoom.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="PCEI-SR-42" {...field} value={field.value || ""} />
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
                      min={42}
                      max={currentRoom.height}
                      {...field}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        if (isNaN(value)) {
                          field.onChange(42);
                        } else {
                          field.onChange(value);
                        }
                      }}
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
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
