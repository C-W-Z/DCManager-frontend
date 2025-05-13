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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Rack, SimpleHost, host_schema } from "@/lib/type";
import { toast } from "sonner";
import { addHost } from "@/lib/api";
import Icon from "@/components/icon";
import { RackContextType } from "@/components/rack-dnd/rack-dnd-reducer";
import { useContextSafe } from "@/lib/utils";

const form_schema = host_schema.pick({ name: true, height: true });

export function AddHostDialog({ context }: { context: RackContextType }) {
  const { state, dispatch } = useContextSafe(context);

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    const newPos = isHostFit(values.height, state.rack);

    if (newPos === null) {
      toast.error("Rack don't have enough space!");
      setOpen(false);
      return;
    }

    addHost({
      name: values.name,
      height: values.height,
      pos: newPos,
      rack_id: state.rack.id,
      room_id: state.rack.room_id,
      dc_id: state.rack.dc_id,
    })
      .then((hostId) => {
        const newHost: SimpleHost = {
          id: hostId,
          name: values.name,
          height: values.height,
          status: "idle",
          ip: "",
          rack_id: state.rack.id,
          pos: newPos,
        };

        dispatch({ type: "ADD_HOST", payload: { host: newHost } });
        toast.success("Host added successfully!");
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error adding host:", error);
        toast.error("Failed to add host");
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit w-full flex-row items-center justify-start gap-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p>New Host</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Host</DialogTitle>
          <DialogDescription>add a new host to current rack</DialogDescription>
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
                    <Input placeholder="Lenovo-SR650" {...field} value={field.value || ""} />
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
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a height" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1U", "2U", "3U", "4U"].map((height) => (
                          <SelectItem key={height} value={height}>
                            {height}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

function isHostFit(hostHeight: number, rack: Rack) {
  const sortedHosts = [...rack.hosts].sort((a, b) => a.pos - b.pos);
  let currentTop = rack.height;

  for (let i = sortedHosts.length - 1; i >= 0; i--) {
    const host = sortedHosts[i];
    const host_top = host.pos + host.height - 1;
    const space = currentTop - host_top;

    if (space >= hostHeight) {
      return currentTop - hostHeight + 1;
    }

    currentTop = host.pos - 1;
  }

  return null;
}
