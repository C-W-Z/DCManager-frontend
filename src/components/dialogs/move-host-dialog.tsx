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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { Host, SimpleRack, APIError } from "@/lib/type";
import { modifyHost, getService, getRack } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/use-user";
import Icon from "@/components/icon";
import { getPossiblePositions } from "@/lib/constant";

interface MoveItemDialogProps {
  host: Host;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSuccess?: (new_rack_name: string) => void;
}

export function MoveHostDialog({ host, isOpen, setIsOpen, onSuccess }: MoveItemDialogProps) {
  const { accessableService } = useUser();
  const [parentRack, setParentRack] = useState<string | null>(null);
  const [loadingRack, setLoadingRack] = useState(false);
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [possiblePositions, setPossiblePositions] = useState<number[]>([]);
  const [selectPos, setSelectPos] = useState<number | null>(null);
  const [loadingPos, setLoadingPos] = useState(false);
  const [loadingMoveRequest, setLoadingMoveRequest] = useState(false);

  const LoadRack = useCallback(async () => {
    try {
      setLoadingRack(true);

      const all: SimpleRack[] = [];
      const service = await getService(host.service_name);
      Object.values(service.allocated_racks).forEach((racks) => {
        all.push(...racks);
      });

      setRacks(all);
      setLoadingRack(false);
    } catch (e) {
      if (e instanceof APIError) {
        console.error(e);
        toast.error(e.error);
      } else {
        console.error("Unexpected Error:", e);
      }

      setRacks([]);
      setLoadingRack(false);
    }
  }, [accessableService]);

  useEffect(() => {
    if (isOpen === false) return;

    LoadRack();
    setParentRack(host.rack_name);
  }, [isOpen, host]);

  const handleSelectRack = (rack_name: string) => {
    setSelectedRack(rack_name);
    setLoadingPos(true);

    getRack(rack_name)
      .then((rack) => {
        setPossiblePositions(getPossiblePositions(host.height, rack));
        setLoadingPos(false);
      })
      .catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
        setPossiblePositions([]);
        setLoadingPos(false);
      });
  };

  const handleMove = async () => {
    if (!selectPos || !selectedRack) return;

    try {
      setLoadingMoveRequest(true);

      modifyHost(host.name, {
        rack_name: selectedRack,
        pos: selectPos,
      }).catch((e: APIError) => {
        console.error(e);
        toast.error(e.error);
      });

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            {`移動主機 ${host.name}`}
          </DialogTitle>
          <DialogDescription>
            {selectedRack ? (
              <span className="text-sm">{`移動至機櫃: ${selectedRack} | 位置: ${selectPos}`}</span>
            ) : (
              <span className="text-sm text-red-500">{"請選擇目的機櫃"}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div>
          {loadingRack ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto rounded-md border">
              <ul className="space-y-1 p-3">
                {racks.map((rack) => (
                  <li
                    key={rack.name}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100",
                      selectedRack === rack.name ? "bg-gray-100" : "",
                      parentRack === rack.name ? "pointer-events-none opacity-50" : "",
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

        <div>
          <Select
            onValueChange={(value) => setSelectPos(parseInt(value))}
            disabled={possiblePositions.length === 0}
          >
            <SelectTrigger className="h-40 w-full">
              <SelectValue placeholder="選擇機櫃內位置" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {possiblePositions.map((pos) => (
                <SelectItem key={pos} value={pos.toString()}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleMove}
            disabled={!selectPos || loadingMoveRequest}
            className="gap-1"
          >
            {loadingMoveRequest ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
