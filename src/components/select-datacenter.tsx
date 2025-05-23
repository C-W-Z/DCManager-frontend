import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { SimpleDatacenter } from "@/lib/type";

interface DataCenterSelectProps {
  dataCenters: SimpleDatacenter[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  allocatedRacks: { dc_name: string; n_racks: number }[];
  index: number;
}

export function DataCenterSelect({
  dataCenters,
  value,
  onChange,
  disabled,
  allocatedRacks,
  index,
}: DataCenterSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter data centers based on search query and exclude already selected dc_names
  const filteredDataCenters = searchQuery
    ? dataCenters.filter((dc) => {
        const isAlreadySelected = allocatedRacks.some(
          (rack, i) => i !== index && rack.dc_name === dc.name,
        );
        return !isAlreadySelected && dc.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : dataCenters.filter((dc) => {
        const isAlreadySelected = allocatedRacks.some(
          (rack, i) => i !== index && rack.dc_name === dc.name,
        );
        return !isAlreadySelected;
      });

  // Focus CommandInput when Popover opens with retry logic
  useEffect(() => {
    // console.log("Popover open change:", open, "inputRef:", inputRef.current);
    if (open && inputRef.current) {
      // console.log("Attempting to focus CommandInput");
      inputRef.current.focus();
    } else if (open) {
      // Retry focusing if inputRef is not yet available
      let attempts = 0;
      const maxAttempts = 3;
      const interval = setInterval(() => {
        if (inputRef.current) {
          // console.log("Retrying focus CommandInput, attempt:", attempts + 1);
          inputRef.current.focus();
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          // console.log("Failed to focus CommandInput after", maxAttempts, "attempts");
          clearInterval(interval);
        }
        attempts++;
      }, 100);
      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        // console.log("Popover onOpenChange:", isOpen);
        setOpen(isOpen);
        if (!isOpen) {
          setSearchQuery("");
          triggerRef.current?.focus();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          className="w-full justify-between border-black"
          disabled={disabled}
        >
          {value || "None"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      {createPortal(
        <PopoverContent className="z-[200] p-0" align="start" side="bottom">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder="Search data centers..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              aria-label="Search data centers"
            />
            <CommandList className="max-h-[200px] overflow-y-auto">
              <CommandEmpty>No data center found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === "" ? "opacity-100" : "opacity-0")}
                  />
                  None
                </CommandItem>
                {filteredDataCenters.map((dc) => (
                  <CommandItem
                    key={dc.name}
                    value={dc.name}
                    onSelect={() => {
                      onChange(dc.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === dc.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {dc.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>,
        document.body,
      )}
    </Popover>
  );
}
