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
import { APIError, Host, host_schema } from "@/lib/type";
import { toast } from "sonner";
import { addHost } from "@/lib/api";
import Icon from "@/components/icon";
import { RackContextType } from "@/components/rack-dnd/rack-dnd-reducer";
import { useContextSafe } from "@/lib/utils";
import { getPossiblePositions } from "@/lib/constant";

const form_schema = host_schema.pick({ name: true, height: true, pos: true });

export function AddHostDialog({
  context,
  onSuccess,
}: {
  context: RackContextType;
  onSuccess?: (newHost: Host) => void;
}) {
  const { state, dispatch } = useContextSafe(context);

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addHost({
      name: values.name,
      height: values.height,
      pos: values.pos,
      rack_name: state.rack.name,
    })
      .then((newHost) => {
        dispatch({ type: "ADD_HOST", payload: { host: newHost } });
        setOpen(false);
        toast.success(`Host  ${values.name} added successfully!`);
        form.reset();
        onSuccess?.(newHost);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-fit w-full flex-row items-center justify-start gap-3 text-sm font-bold">
          <Icon id="add" className="size-4 fill-white" />
          <p className="pr-2">新增主機</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>新增主機</DialogTitle>
          <DialogDescription>請指定名字、高度以及位置。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主機名字</FormLabel>
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
                  <FormLabel>主機高度</FormLabel>
                  <FormControl>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇一個高度" />
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
            <FormField
              control={form.control}
              name="pos"
              render={({ field }) => {
                const selectedHeight = form.watch("height");
                const possiblePositions = getPossiblePositions(selectedHeight, state.rack);

                return (
                  <FormItem>
                    <FormLabel>機櫃內位置</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={possiblePositions.length === 0}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="選擇一個位置" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] overflow-y-auto">
                          {possiblePositions.map((pos) => (
                            <SelectItem key={pos} value={pos.toString()}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">新增</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
