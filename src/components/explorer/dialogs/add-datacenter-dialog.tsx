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
import { useEffect, useState } from "react";
import { datacenter_schema, IpRange } from "@/lib/type";
import { toast } from "sonner";
import { addDC } from "@/lib/api";
import { MAX_HEIGHT } from "@/lib/constant";
import Icon from "@/components/icon";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

export function AddDatacenterDialog() {
  const [open, setOpen] = useState(false);
  const [ipRanges, setIpRanges] = useState<IpRange[]>([]);
  const [hasEmptyIpRange, setHasEmptyIpRange] = useState(false);

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

  // 检查是否有空的IP范围
  useEffect(() => {
    const hasEmpty = ipRanges.some((range) => !range.start_ip || !range.end_ip);
    setHasEmptyIpRange(hasEmpty);
  }, [ipRanges]);

  const handleIpRangeChange = (index: number, field: keyof IpRange, value: string) => {
    setIpRanges((prev) => {
      const newRanges = [...prev];
      newRanges[index] = { ...newRanges[index], [field]: value };
      return newRanges;
    });
  };

  const addIpRange = () => {
    setIpRanges((prev) => [...prev, { start_ip: "", end_ip: "" }]);
  };

  const removeIpRange = (index: number) => {
    setIpRanges((prev) => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values: z.infer<typeof form_schema>) {
    addDC({
      name: values.name,
      height: values.height,
      ip_ranges: ipRanges,
    })
      .then(() => {
        setOpen(false);
        form.reset();
        toast.success(`Data center ${values.name} added successfully`);
      })
      .catch((error) => {
        toast.error(`Failed to add data center: ${error.message}`);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit min-w-[130px] flex-row items-center justify-start gap-3 py-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p>New DC</p>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>IP Ranges</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIpRange}
                  className="h-8"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add IP Range
                </Button>
              </div>
              {ipRanges.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                  No IP range has been set. Click the button above to add one.
                </div>
              ) : (
                <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {ipRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Starting IP"
                          value={range.start_ip}
                          onChange={(e) =>
                            handleIpRangeChange(index, "start_ip", e.target.value)
                          }
                          className={!range.start_ip ? "border-red-300" : ""}
                        />
                      </div>
                      <div className="flex w-8 items-center justify-center">
                        <span className="text-gray-500">to</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Ending IP"
                          value={range.end_ip}
                          onChange={(e) =>
                            handleIpRangeChange(index, "end_ip", e.target.value)
                          }
                          className={!range.end_ip ? "border-red-300" : ""}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIpRange(index)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {hasEmptyIpRange && (
                <p className="text-sm text-red-500">
                  Please fill in all IP ranges or delete the blanks
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={hasEmptyIpRange}>Add</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
