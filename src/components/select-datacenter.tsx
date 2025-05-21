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
}

export function DataCenterSelect({
  dataCenters,
  value,
  onChange,
  disabled,
}: DataCenterSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter data centers based on search query
  const filteredDataCenters = searchQuery
    ? dataCenters.filter((dc) => dc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dataCenters;

  // Focus CommandInput when Popover opens
  useEffect(() => {
    console.log("open change");
    if (open && inputRef.current) {
      console.log("foucus");
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchQuery("");
          triggerRef.current?.focus();
        }
      }}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          className="w-full justify-between border-black"
          disabled={disabled}
        >
          {disabled ? "Loading data centers..." : value || "None"}
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
              ref={inputRef}
              placeholder="Search data centers..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onClick={(e) => e.stopPropagation()}
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
