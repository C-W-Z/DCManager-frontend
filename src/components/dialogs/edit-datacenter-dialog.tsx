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
import {
  datacenter_schema,
  type APIError,
  type Datacenter,
  type SimpleDatacenter,
} from "@/lib/type";
import { getDC, modifyDC } from "@/lib/api";
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

export function EditDatacenterDialog({
  datacenter,
  onUpdateSuccess,
}: {
  datacenter: SimpleDatacenter;
  onUpdateSuccess?: (updatedDC: SimpleDatacenter) => void;
}) {
  // 添加内部状态管理打开/关闭状态
  const [open, setOpen] = useState(false);

  const [constraints, setConstraints] = useState<{ min: number; max: number }>({
    min: 42,
    max: MAX_HEIGHT,
  });

  const form_schema = datacenter_schema
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
      name: datacenter.name,
      height: datacenter.height,
    },
  });

  const getHighestRoomHeight = (dc: Datacenter) => {
    let max = 0;
    for (const room of dc.rooms) {
      if (room.height > max) {
        max = room.height;
      }
    }
    return max;
  };

  const getConstrains = useCallback(async (simple_dc: SimpleDatacenter) => {
    try {
      const dc = await getDC(simple_dc.name);
      const highestRoomHeight = getHighestRoomHeight(dc);
      setConstraints({
        min: highestRoomHeight,
        max: MAX_HEIGHT,
      });
    } catch (e) {
      console.error("Failed to get constraints:", e);
    }
  }, [])

  useEffect(() => {
    if (!datacenter) return;
    setOpen(true);
    getConstrains(datacenter);
  }, [datacenter, getConstrains]);

  function onSubmit(values: z.infer<typeof form_schema>) {
    modifyDC(datacenter.name, {
      name: values.name,
      height: values.height,
    })
      .then(() => {
        toast.success(`Datacenter ${values.name} updated successfully`);
        form.reset();

        if (onUpdateSuccess) {
          const updatedDC: SimpleDatacenter = {
            ...datacenter,
            name: values.name,
            height: values.height,
          };
          onUpdateSuccess(updatedDC);
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
            <Edit className="h-5 w-5" /> Edit Data Center
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
