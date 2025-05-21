import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { simple_service_schema, SimpleDatacenter } from "@/lib/type";
import { toast } from "sonner";
import { addService, getAllDC } from "@/lib/api";
import Icon from "@/components/icon";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { createPortal } from "react-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";

const form_schema = simple_service_schema.pick({
  name: true,
  allocated_subnet: true,
});

type RackAllocation = { dc_name: string; n_racks: number };

export function AddServiceDialog() {
  const [open, setOpen] = useState(false);
  const [allocatedRacks, setAllocatedRacks] = useState<RackAllocation[]>([]);
  const [hasEmptyAllocatedRacks, setHasEmptyAllocatedRacks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: "",
      allocated_subnet: "",
    },
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      getAllDC()
        .then((data) => {
          setDataCenters(data);
        })
        .catch((error) => {
          console.error("Failed to fetch data centers:", error);
          toast.error("Failed to load data centers");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    const hasEmpty = allocatedRacks.some((rack) => !rack.dc_name.trim() || rack.n_racks === 0);
    setHasEmptyAllocatedRacks(hasEmpty);
  }, [allocatedRacks]);

  const handleAllocatedRacksChange = (
    index: number,
    field: "dc_name" | "n_racks",
    value: string,
  ) => {
    setAllocatedRacks((prev) =>
      prev.map((rack, i) =>
        i === index
          ? {
              ...rack,
              [field]: field === "n_racks" ? parseInt(value) || 0 : value,
            }
          : rack,
      ),
    );
    setErrorMessage(null); // Clear error message on input change
  };

  const addAllocatedRacks = () => {
    setAllocatedRacks((prev) => [...prev, { dc_name: "", n_racks: 0 }]);
    setErrorMessage(null); // Clear error message when adding a new rack
  };

  const removeAllocatedRacks = (index: number) => {
    setAllocatedRacks((prev) => prev.filter((_, i) => i !== index));
    setErrorMessage(null); // Clear error message when removing a rack
  };

  function onSubmit(values: z.infer<typeof form_schema>) {
    setErrorMessage(null); // Clear previous error message
    const n_allocated_racks = allocatedRacks.reduce(
      (acc, rack) => {
        if (rack.dc_name.trim() && rack.n_racks > 0) {
          acc[rack.dc_name] = rack.n_racks;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log(n_allocated_racks);
    setLoading(true);

    addService({
      name: values.name,
      n_allocated_racks,
      allocated_subnet: values.allocated_subnet,
    })
      .then(() => {
        toast.success(`Service ${values.name} added successfully!`);
        form.reset();
        setAllocatedRacks([]);
        setOpen(false); // Only close on success
      })
      .catch((error) => {
        console.error("Error adding service:", error);
        const message = error.message || "Failed to add service";
        setErrorMessage(message); // Set error message
        toast.error(message); // Show toast as well
      })
      .finally(() => {
        setLoading(false);
      });
  }

  // Focus CommandInput when Popover opens
  useEffect(() => {
    if (popoverOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [popoverOpen]);

  const DCPopover = useMemo(() => {
    return function ServicePopoverComponent({index}: {index: number}) {
      const [searchQuery, setSearchQuery] = useState("");

      // Filter services based on search query
      const filteredServices = searchQuery
        ? dataCenters.filter((dc) => dc.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : dataCenters;

      return (
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open);
            if (!open) {
              setSearchQuery("");
              popoverTriggerRef.current?.focus();
            }
          }}
          modal={true}
        >
          <PopoverTrigger asChild>
            <Button
              ref={popoverTriggerRef}
              variant="outline"
              role="combobox"
              className="w-full justify-between border-black"
              disabled={loading}
            >
              {loading ? "Loading data centers..." : allocatedRacks[index].dc_name || "None"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          {createPortal(
            <PopoverContent
              className="z-[200] p-0"
              align="start"
              side="bottom"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
            >
              <Command>
                <CommandInput
                  ref={commandInputRef}
                  placeholder="Search data centers..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Search data centers"
                />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>No service found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        handleAllocatedRacksChange(index, "dc_name", "");
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          allocatedRacks[index].dc_name === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      None
                    </CommandItem>
                    {filteredServices.map((dc) => (
                      <CommandItem
                        key={dc.name}
                        value={dc.name}
                        onSelect={() => {
                          handleAllocatedRacksChange(index, "dc_name", dc.name);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            allocatedRacks[index].dc_name === dc.name
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {dc.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>,
            document.body, // Render PopoverContent at the root
          )}
        </Popover>
      );
    };
  }, [dataCenters, allocatedRacks, popoverOpen, loading]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setErrorMessage(null); // Clear error message when closing dialog
          form.reset();
          setAllocatedRacks([]);
        }
      }}
    >
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
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allocated_subnet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Subnet</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="192.168.1.0/24"
                      {...field}
                      value={field.value || ""}
                      required
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setErrorMessage(null); // Clear error message on input change
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Racks in Data Centers</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAllocatedRacks}
                  className="h-8"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Data Center
                </Button>
              </div>
              {allocatedRacks.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
                  No Data Center has been set. Click the button above to add one.
                </div>
              ) : (
                <div className="max-h-[240px] space-y-3 overflow-y-auto pr-2">
                  {allocatedRacks.map((rack, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <DCPopover index={index} />
                      </div>
                      <div className="flex w-8 items-center justify-center">
                        <span className="text-gray-500">to</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Number of Racks"
                          value={rack.n_racks.toString()}
                          onChange={(e) =>
                            handleAllocatedRacksChange(index, "n_racks", e.target.value)
                          }
                          className={rack.n_racks > 0 ? "" : "border-red-300"}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAllocatedRacks(index)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {hasEmptyAllocatedRacks && (
                <p className="text-sm text-red-500">
                  Please choose all DC names and number of racks or delete the blanks
                </p>
              )}
              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || hasEmptyAllocatedRacks}>
                {loading ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}