"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Edit, AlertCircle, ChevronsUpDown, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import type { SimpleRack, SimpleService } from "@/lib/type";
import { modifyRack, getAllService } from "@/lib/api";
import { toast } from "sonner";

interface EditRackDialogProps {
  rack: SimpleRack | null;
  onUpdateSuccess?: (updatedRack: SimpleRack) => void;
}

export function EditRackDialog({ rack, onUpdateSuccess }: EditRackDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    service_id: "", // Use service_id instead of service_name
    height: "",
  });

  const hasHosts = rack ? rack.n_hosts > 0 : false;

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

  // Initialize form data when rack changes
  useEffect(() => {
    if (!rack) return;
    setOpen(true);
    setFormData({
      name: rack.name,
      service_id: rack.service_id || "", // Use service_id
      height: rack.height.toString(),
    });
  }, [rack]);

  // Focus CommandInput when Popover opens
  useEffect(() => {
    if (popoverOpen && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [popoverOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!rack) return;
    e.preventDefault();
    setError(null);

    modifyRack(rack.id, {
      name: formData.name,
      service_id: formData.service_id || "", // Use service_id
      height: Number.parseInt(formData.height),
      room_id: rack.room_id,
    })
      .then(() => {
        const updatedRack: SimpleRack = {
          ...rack,
          name: formData.name,
          service_id: formData.service_id,
          service_name:
            services.find((service) => service.id === formData.service_id)?.name || "",
          height: Number.parseInt(formData.height),
        };
        toast.success(`Rack ${formData.name} edited successfully`);
        if (onUpdateSuccess) onUpdateSuccess(updatedRack);
        setOpen(false);
      })
      .catch((error) => {
        console.error("Error updating rack:", error);
        setError("Failed to edit Rack.");
      });
  };

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
              {loading
                ? "Loading services..."
                : formData.service_id
                  ? services.find((service) => service.id === formData.service_id)?.name ||
                    "None"
                  : "None"}
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
                  placeholder="Search service..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Search services"
                />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>No service found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="none"
                      onSelect={() => {
                        setFormData((prev) => ({ ...prev, service_id: "" }));
                        setPopoverOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.service_id === "" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      None
                    </CommandItem>
                    {filteredServices.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.name}
                        onSelect={() => {
                          setFormData((prev) => ({ ...prev, service_id: service.id }));
                          setPopoverOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.service_id === service.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {service.name}
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
  }, [services, formData.service_id, popoverOpen, loading]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Edit className="h-5 w-5" /> Edit Rack
          </DialogTitle>
        </DialogHeader>

        {hasHosts && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              There are hosts in this rack, so the height cannot be changed. Please remove all
              hosts before changing the height.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (U)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              required
              disabled={hasHosts}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service_id">Service</Label>
            <ServicePopover />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
