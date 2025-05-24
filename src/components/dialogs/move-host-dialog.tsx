"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import type { Host, SimpleRack, Rack, APIError } from "@/lib/type";
import { modifyHost, getService, getRack } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/use-user";
import Icon from "@/components/icon";

interface MoveItemDialogProps {
  items: Host[];
  onSuccess?: (new_rack_name: string) => void;
}

export function MoveHostDialog({ items, onSuccess }: MoveItemDialogProps) {
  const { accessableService } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [parentRacks, setParentRacks] = useState<string[]>([]);
  const [loadingRack, setLoadingRack] = useState(false);
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [newPos, setNewPos] = useState<Record<string, number> | null>(null);
  const [loadingPos, setLoadingPos] = useState(false);
  const [loadingMoveRequest, setLoadingMoveRequest] = useState(false);

  const LoadRack = useCallback(async () => {
    try {
      setLoadingRack(true);

      const all: SimpleRack[] = [];
      for (const serviceName of accessableService) {
        getService(serviceName)
          .then((service) => {
            Object.values(service.allocated_racks).forEach((racks) => {
              all.push(...racks);
            });
          })
          .catch((e: APIError) => {
            console.error(e);
            toast.error(e.error);
          });
      }

      setRacks(all);
      setLoadingRack(false);
    } catch (error) {
      console.error("Error loading racks", error);
      setRacks([]);
      setLoadingRack(false);
    }
  }, [accessableService]);

  const initParentRacks = useCallback(() => {
    const parentRacks: Set<string> = new Set();
    items.forEach((item) => {
      if (item.rack_name) {
        parentRacks.add(item.rack_name);
      }
    });
    setParentRacks(Array.from(parentRacks));
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      setIsOpen(true);
      LoadRack();
      initParentRacks();
    } else {
      setIsOpen(false);
    }
  }, [LoadRack, initParentRacks, items]);

  const handleSelectRack = (rack_name: string) => {
    setSelectedRack(rack_name);
    setLoadingPos(true);

    getRack(rack_name)
      .then((rack) => {
        const newPos = isHostFit(items, rack);
        setNewPos(newPos);
        setLoadingPos(false);
      })
      .catch((error) => {
        console.error("Error fetching rack data:", error);
        setNewPos(null);
        setLoadingPos(false);
      });
  };

  const isHostFit = (insertHosts: Host[], rack: Rack) => {
    if (rack.hosts.length === 0) {
      const newPos: Record<string, number> = {};
      let currentTop = rack.height;
      for (const host of insertHosts) {
        newPos[host.name] = currentTop - host.height + 1;
        currentTop -= host.height;
      }
      return newPos;
    }

    const sortedHosts = [...rack.hosts].sort((a, b) => a.pos - b.pos);
    let currentTop = rack.height;
    let currentInsert = 0;
    const newPos: Record<string, number> = {};

    for (let i = sortedHosts.length - 1; i >= 0; i--) {
      const host = sortedHosts[i];
      const host_top = host.pos + host.height - 1;
      const space = currentTop - host_top;

      if (space >= insertHosts[currentInsert].height) {
        newPos[insertHosts[currentInsert].name] =
          currentTop - insertHosts[currentInsert].height + 1;
        currentTop -= insertHosts[currentInsert].height;

        currentInsert++;
        if (currentInsert >= insertHosts.length) {
          return newPos;
        }
      } else {
        currentTop = host.pos - 1;
      }
    }

    return null;
  };

  const handleMove = async () => {
    if (!newPos || !selectedRack) return;

    try {
      setLoadingMoveRequest(true);

      for (const item of items) {
        await modifyHost(item.name, {
          rack_name: selectedRack,
          pos: newPos[item.name],
        });
      }

      toast.success(`成功將主機移動到 ${selectedRack}`);
      onSuccess?.(selectedRack);
      setLoadingMoveRequest(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error moving host:", error);
      setLoadingMoveRequest(false);
      toast.error(`主機移動失敗`);
    }
  };

  if (items.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            {items.length > 1 ? `移動多台主機` : `移動主機 ${items[0].name}`}
          </DialogTitle>
          <DialogDescription>
            {newPos ? (
              <span className="text-sm">
                {items.length > 1
                  ? `目的機櫃: ${selectedRack}`
                  : `目的機櫃: ${selectedRack} (位置: ${newPos[items[0].name]})`}
              </span>
            ) : (
              <span className="text-sm text-red-500">
                {selectedRack === null
                  ? "請選擇目的機櫃"
                  : "無法將主機移動到此機櫃，請選擇其他機櫃"}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div>
          {loadingRack ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              <ul className="space-y-1 p-3">
                {racks.map((rack) => (
                  <li
                    key={rack.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100",
                      selectedRack === rack.name ? "bg-gray-100" : "",
                      parentRacks.includes(rack.name) ? "pointer-events-none opacity-50" : "",
                    )}
                    onClick={() => handleSelectRack(rack.name)}
                  >
                    <div className="flex items-center gap-2">
                      {loadingPos && selectedRack === rack.name ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                      ) : (
                        <Icon id="rack" className="size-4" />
                      )}
                      <span>{rack.name}</span>
                    </div>
                    <MoveRight></MoveRight>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleMove}
            disabled={!newPos || loadingMoveRequest}
            className="gap-1"
          >
            {loadingMoveRequest ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
