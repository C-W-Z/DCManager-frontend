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
import { cn } from "@/lib/utils";
import { Rack, SimpleHost, host_schema } from "@/lib/type";
import { toast } from "sonner";
import { addHost } from "@/lib/api";

const form_schema = host_schema.pick({ name: true, height: true });

interface AddHostDialogProps {
  rack: Rack;
  setRack: (rack: Rack) => void;
  isUpdate: boolean;
}
export function AddHostDialog({ rack, setRack, isUpdate }: AddHostDialogProps) {
  const [open, setOpen] = useState(false);
  const [isRackFull, setIsRackFull] = useState(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    const [new_host_index, new_host_pos] = calculateNewHostPos(rack, values);

    if (new_host_index === null || new_host_pos === null) {
      setIsRackFull(true);
      return;
    }

    addHost({
      name: values.name,
      height: values.height,
      rack_id: rack.id,
      room_id: rack.room_id,
      dc_id: rack.dc_id,
      pos: new_host_pos,
    })
      .then((new_host_id) => {
        const new_host = {
          id: new_host_id,
          name: values.name,
          height: values.height,
          status: "idle",
          rack_id: rack.id,
          pos: new_host_pos,
        } as SimpleHost;

        const new_hosts = [...rack.hosts];
        new_hosts.splice(new_host_index, 0, new_host);

        setRack({
          ...rack,
          hosts: new_hosts,
          n_hosts: rack.n_hosts + 1,
        });

        setIsRackFull(false);
        setOpen(false);
        form.reset();

        toast.success(`Host ${values.name} added successfully`);
      })
      .catch((error) => {
        setIsRackFull(false);
        toast.error(`Failed to add host: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("w-[140px]", isUpdate ? "pointer-events-none bg-gray-300" : "")}>
          Add Host
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
            {isRackFull && <div className="text-red-500">Rack don't have enough space!</div>}
            <Button type="submit" className="w-full">
              Add
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function calculateNewHostPos(rack: Rack, new_host: z.infer<typeof form_schema>) {
  let new_host_pos;
  let current_top = rack.height;

  for (let i = rack.hosts.length - 1; i >= 0; i--) {
    const host = rack.hosts[i];
    const host_top = host.pos + host.height - 1;
    const space = current_top - host_top;

    if (space >= new_host.height) {
      new_host_pos = current_top - new_host.height + 1;

      return [i + 1, new_host_pos];
    }

    current_top = host.pos - 1;
  }

  return [null, null]; // No space found
}
