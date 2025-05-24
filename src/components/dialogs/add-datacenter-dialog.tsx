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
import { Datacenter, datacenter_schema } from "@/lib/type";
import { toast } from "sonner";
import { addDC } from "@/lib/api";
import { MAX_HEIGHT } from "@/lib/constant";
import Icon from "@/components/icon";

export function AddDatacenterDialog({
  onSuccess,
}: {
  onSuccess?: (newDatacenter: Datacenter) => void;
}) {
  const [open, setOpen] = useState(false);

  const form_schema = datacenter_schema
    .pick({
      name: true,
      height: true,
    })
    .extend({
      height: z.coerce.number().int().min(42).max(MAX_HEIGHT),
    });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addDC({
      name: values.name,
      height: values.height,
    })
      .then((newDatacenter) => {
        setOpen(false);
        toast.success(`Datacenter ${values.name} added successfully`);
        form.reset();
        onSuccess?.(newDatacenter);
      })
      .catch((error) => {
        toast.error(`Failed to add datacenter: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p className="pr-2">New DC</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Add New Data Center</DialogTitle>
          <DialogDescription>add a new data center</DialogDescription>
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
                    <Input placeholder="Taipei-A1" {...field} value={field.value || ""} />
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
                      max={MAX_HEIGHT}
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
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
