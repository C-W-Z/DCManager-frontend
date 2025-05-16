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
import { service_schema } from "@/lib/type";
import { toast } from "sonner";
import { addService } from "@/lib/api";
import Icon from "@/components/icon";

const form_schema = service_schema.pick({ name: true, n_racks: true, total_ip: true });

export function AddServiceDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addService({
      name: values.name,
      n_racks: values.n_racks,
      total_ip: values.total_ip,
    })
      .then(() => {
        toast.success(`Service ${values.name} added successfully!`);
      })
      .catch((error) => {
        console.error("Error adding service:", error);
        toast.error("Failed to add service");
      });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit w-fit flex-row items-center justify-start gap-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p className="pr-2">New Service</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
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
                    <Input
                      placeholder="Cloud-Service-A"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="n_racks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Racks Needed (max 10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                      value={field.value || ""}
                      min={1}
                      max={10}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        } else {
                          field.onChange(0);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total_ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Needed (max 128)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1"
                      {...field}
                      value={field.value || ""}
                      min={1}
                      max={128}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        } else {
                          field.onChange(0);
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
