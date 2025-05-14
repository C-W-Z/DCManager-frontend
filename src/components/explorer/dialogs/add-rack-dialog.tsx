"use client";

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
import { useState, useEffect, useRef, useMemo } from "react";
import {
  rack_schema,
  type SimpleDatacenter,
  type SimpleRoom,
  type SimpleService,
} from "@/lib/type";
import { toast } from "sonner";
import { addRack, getAllService } from "@/lib/api";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface AddRackDialogProps {
  currentDC: SimpleDatacenter;
  currentRoom: SimpleRoom;
  onSuccess?: () => void;
}

export function AddRackDialog({ currentRoom, currentDC, onSuccess }: AddRackDialogProps) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Fetch services when dialog opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      getAllService()
        .then((data) => {
          setServices(data);
        })
        .catch((error) => {
          console.error("Failed to fetch services:", error);
          toast.error("Failed to load services");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  // Focus CommandInput when Popover opens
  useEffect(() => {
    if (popoverOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [popoverOpen]);

  const form_schema = rack_schema
    .pick({
      name: true,
      height: true,
    })
    .extend({
      height: z.coerce.number().int().min(42).max(currentRoom.height),
      service_id: z.string().optional(),
    });

  const form = useForm<z.infer<typeof form_schema>>({
    resolver: zodResolver(form_schema),
    defaultValues: {
      name: "",
      height: 42,
      service_id: "",
    },
  });

  function onSubmit(values: z.infer<typeof form_schema>) {
    addRack({
      name: values.name,
      height: values.height,
      room_id: currentRoom.id,
      dc_id: currentDC.id,
      service_id: values.service_id || "",
    })
      .then(() => {
        setOpen(false);
        form.reset();
        toast.success(`Rack ${values.name} added successfully`);
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        toast.error(`Failed to add rack: ${error.message}`);
      });
  }

  const ServicePopover = useMemo(() => {
    return function ServicePopoverComponent() {
      const [searchQuery, setSearchQuery] = useState("");

      // Filter services based on search query
      const filteredServices = searchQuery
        ? services.filter((service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : services;

      return (
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open);
            if (!open) {
              setSearchQuery(""); // Clear search when closing
              popoverTriggerRef.current?.focus();
            }
          }}
          modal={true}
        >
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                ref={popoverTriggerRef}
                variant="outline"
                role="combobox"
                className="justify-between border-black"
                disabled={loading}
              >
                {loading
                  ? "Loading services..."
                  : form.getValues("service_id")
                    ? services.find((service) => service.id === form.getValues("service_id"))
                        ?.name || "None"
                    : "None"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </FormControl>
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
                  placeholder="Search service..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Search services"
                />
                <CommandList>
                  <CommandEmpty>No service found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        form.setValue("service_id", "");
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          form.getValues("service_id") === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      None
                    </CommandItem>
                    {filteredServices.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.name}
                        onSelect={() => {
                          form.setValue("service_id", service.id);
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            form.getValues("service_id") === service.id
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {service.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>,
            document.body,  // Render PopoverContent at the root
          )}
        </Popover>
      );
    };
  }, [services, form, popoverOpen, loading]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>New Rack</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Rack</DialogTitle>
          <DialogDescription>
            Add a new rack to current position:
            <br />
            {currentDC.name}/{currentRoom.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        if (isNaN(value)) {
                          field.onChange(42);
                        } else {
                          field.onChange(value);
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
              name="service_id"
              render={() => (
                <FormItem className="flex flex-col">
                  <FormLabel>Service</FormLabel>
                  <ServicePopover />
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
