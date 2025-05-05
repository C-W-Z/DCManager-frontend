import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { room_schema, SimpleDatacenter } from "@/lib/type";
import { toast } from "sonner";
import { addRoom } from "@/lib/api";
import Icon from "@/components/icon";

interface AddRoomDialogProps {
  currentDC: SimpleDatacenter;
}

export function AddRoomDialog({ currentDC }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false);

  const form_schema = room_schema
    .pick({
      name: true,
      height: true,
    })
    .extend({
      height: z.coerce.number().int().min(42).max(currentDC.height),
    });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addRoom({
      name: values.name,
      height: values.height,
      dc_id: currentDC.id,
    })
      .then(() => {
        setOpen(false);
        form.reset();
        toast.success(`Room ${values.name} added successfully`);
      })
      .catch((error) => {
        toast.error(`Failed to add room: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit min-w-[130px] flex-row items-center justify-start gap-3 py-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p>New Room</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            add a new room to current position:
            <br />
            {currentDC.name}
          </DialogDescription>
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
                      min={42}
                      max={currentDC.height}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Add
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
