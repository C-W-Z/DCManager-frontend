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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Rack, SimpleRack, host_schema } from "@/lib/type";
import Icon from "@/components/icon";
import { getAllRack } from "@/lib/api";

const form_schema = z.object({
  rack_id: z.string(),
  pos: z.number(),
});

export function MoveHostDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "flex h-fit w-full flex-row items-center justify-start gap-3 text-sm font-bold",
          )}
        >
          <Icon id="move" className="size-4 fill-white" />
          <p>Move Host To Other Rack</p>
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
              name="rack_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select A Rack</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a height" />
                      </SelectTrigger>
                      <SelectContent>
                        {rackList.map((rack) => (
                          <SelectItem key={rack.id} value={rack.id}>
                            {rack.name}
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
              Move
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
