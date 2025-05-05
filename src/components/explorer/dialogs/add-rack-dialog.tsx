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
import { rack_schema, SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { toast } from "sonner";
import { addRack } from "@/lib/api";

interface AddRackDialogProps {
  currentDC: SimpleDatacenter;
  currentRoom: SimpleRoom;
}

export function AddRackDialog({ currentRoom, currentDC }: AddRackDialogProps) {
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
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addRack({
      name: values.name,
      height: values.height,
      room_id: currentRoom.id,
      dc_id: currentDC.id,
    })
      .then(() => {
        setOpen(false);
        form.reset();
        toast.success(`Rack ${values.name} added successfully`);
      })
      .catch((error) => {
        toast.error(`Failed to add rack: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-[140px]">Add Rack</Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Rack</DialogTitle>
          <DialogDescription>
            add a new rack to current position:
            <br />
            {currentDC.name}/{currentRoom.name}
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
