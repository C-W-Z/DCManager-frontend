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
import { MoveRight, Home, Move, MoveLeft } from "lucide-react";
import type { SimpleDatacenter, Host, SimpleRack, SimpleRoom, Rack } from "@/lib/type";
import {
  getAllDC,
  getDC,
  modifyRoom,
  modifyRack,
  getRoom,
  getRack,
  modifyHost,
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type MoveItemType = "room" | "rack" | "host";

interface MoveItemDialogProps {
  type: MoveItemType;
  items: (SimpleRoom | SimpleRack | Host)[];
  onSuccess?: (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => void;
}

export function MoveItemDialog({ type, items, onSuccess }: MoveItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataCenters, setDataCenters] = useState<SimpleDatacenter[]>([]);
  const [rooms, setRooms] = useState<SimpleRoom[]>([]);
  const [racks, setRacks] = useState<SimpleRack[]>([]);
  const [selectedDC, setSelectedDC] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [selectedRackPos, setSelectedRackPos] = useState<number | null>(null);
  const [checkingRackPos, setCheckingRackPos] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  const [parentDCId, setParentDCId] = useState<string | null>(null);
  const [parentRoomId, setParentRoomId] = useState<string | null>(null);
  const [parentRackId, setParentRackId] = useState<string | null>(null);

  const loadRacksByRoomId = useCallback(async (room_name: string) => {
    setLoadingDestinations(true);
    try {
      const room = await getRoom(room_name);
      setRacks(room.racks);
    } catch (error) {
      console.error("Error loading racks:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  // 加载指定数据中心的房间
  const loadRoomsByDCId = useCallback(async (dc_name: string) => {
    setLoadingDestinations(true);
    try {
      const dc = await getDC(dc_name);
      setRooms(dc.rooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  // 加载所有数据中心
  const loadDataCenters = useCallback(async () => {
    setLoadingDestinations(true);
    try {
      const dcs = await getAllDC();
      setDataCenters(dcs);
    } catch (error) {
      console.error("Error loading data centers:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  const loadParentLevel = useCallback(async () => {
    loadDataCenters();
    switch (type) {
      case "room": {
        setParentDCId((items[0] as SimpleRoom).dc_name);
        setSelectedDC((items[0] as SimpleRoom).dc_name);
        break;
      }
      case "rack": {
        try {
          const room = await getRoom((items[0] as SimpleRack).room_name);
          if (room.name !== (items[0] as SimpleRack).room_name)
            console.error("room.name !== item.room_name");
          loadRoomsByDCId(room.dc_name);
          setParentDCId(room.dc_name);
          setSelectedDC(room.dc_name);
          setParentRoomId(room.name);
          setSelectedRoom(room.name);
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
        break;
      }
      case "host": {
        try {
          const rack = await getRack((items[0] as Host).rack_name);
          if (rack.name !== (items[0] as Host).rack_name)
            console.error("rack.name !== item.rack_name");
          loadRoomsByDCId(rack.dc_name);
          setParentDCId(rack.dc_name);
          setSelectedDC(rack.dc_name);
          loadRacksByRoomId(rack.room_name);
          setParentRoomId(rack.room_name);
          setSelectedRoom(rack.room_name);
          setParentRackId(rack.name);
          setSelectedRack(rack.name);
        } catch (error) {
          console.error("Error loading racks:", error);
        }
        break;
      }
      default:
        break;
    }
  }, [loadDataCenters, type, items, loadRoomsByDCId, loadRacksByRoomId]);

  // 当 item 变化时，如果有值则打开对话框
  useEffect(() => {
    if (items.length > 0) {
      setIsOpen(true);
      loadParentLevel();
    } else {
      // 重置选择状态
      setSelectedDC(null);
      setSelectedRoom(null);
      setSelectedRack(null);
    }
  }, [items, loadParentLevel]);

  // 处理数据中心选择
  const handleSelectDC = (dc_name: string) => {
    setSelectedDC(dc_name);
    setSelectedRoom(null);
    loadRoomsByDCId(dc_name);
  };

  // 处理房间选择
  const handleSelectRoom = (room_name: string) => {
    setSelectedRoom(room_name);
    loadRacksByRoomId(room_name);
  };

  const handleSelectRack = (rack_name: string) => {
    setSelectedRack(rack_name);
    setCheckingRackPos(true);
  };

  const handleSelectParentLevel = () => {
    switch (type) {
      case "rack":
        if (selectedRoom) setSelectedRoom(null);
        setSelectedDC(null);
        break;
      case "host":
        if (selectedRack) setSelectedRack(null);
        if (selectedRoom) {
          setSelectedRoom(null);
        } else if (selectedDC) {
          setSelectedDC(null);
        }
        break;
      default:
        break;
    }
    if (selectedRack) {
      setSelectedRack(null);
    } else if (selectedRoom) {
      setSelectedRoom(null);
    } else if (selectedDC) {
      setSelectedDC(null);
    }
  };

  const showDCList = !selectedDC || type === "room";
  const showRoomList = type !== "room" && selectedDC && (!selectedRoom || type === "rack");
  const showRackList = type === "host" && selectedDC && selectedRoom;

  const getPromises = () => {
    if (type === "room" && selectedDC)
      return items.map((item) => modifyRoom(item.name, { dc_name: selectedDC }));
    if (type === "rack" && selectedRoom)
      return items.map((item) => modifyRack(item.name, { room_name: selectedRoom }));
    if (type === "host" && selectedRack)
      return items.map((item) => {
        if (selectedRackPos !== null)
          modifyHost(item.name, { rack_name: selectedRack, pos: selectedRackPos });
      });
    return items.map(() => Promise.resolve(false));
  };

  // 处理移动确认
  const handleMove = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const movePromises = getPromises();
      const results = await Promise.all(movePromises);
      const allSuccessful = results.every((result) => result === true || result === undefined);

      // 关闭对话框并通知成功
      setIsOpen(false);
      const names =
        items.length > 1
          ? `${items.length} ${getTypeName()}s`
          : `${getTypeName()} ${items[0].name}`;
      toast.success(names + " has successfully move to " + getSelectedDestinationName());
      if (allSuccessful) {
        if (onSuccess)
          onSuccess({
            dc_name: selectedDC,
            room_name: selectedRoom,
            rack_name: selectedRack,
          });
      } else console.error("Some move operations failed");
    } catch (error) {
      console.error(`Error moving ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = () => {
    switch (type) {
      case "room":
        return "Room";
      case "rack":
        return "Rack";
      case "host":
        return "Host";
      default:
        return "";
    }
  };

  // const getDestinationTypeName = () => {
  //   switch (type) {
  //     case "room":
  //       return "Data Center";
  //     case "rack":
  //       return "Room";
  //     case "host":
  //       return "Rack";
  //     default:
  //       return "";
  //   }
  // };

  // 检查是否可以移动
  const canMove = () => {
    if (items.length === 0) return false;
    if (type === "room")
      return !!selectedDC && selectedDC !== (items[0] as SimpleRoom).dc_name;
    if (type === "rack")
      return !!selectedRoom && selectedRoom !== (items[0] as SimpleRack).room_name;
    if (type === "host")
      return (
        selectedRackPos &&
        selectedRackPos !== -1 &&
        !!selectedRack &&
        selectedRack !== (items[0] as Host).rack_name
      );
    return false;
  };

  const isHostFit = (hostHeight: number, rack: Rack) => {
    const sortedHosts = [...rack.hosts].sort((a, b) => a.pos - b.pos);
    let currentTop = rack.height;

    for (let i = sortedHosts.length - 1; i >= 0; i--) {
      const host = sortedHosts[i];
      const host_top = host.pos + host.height - 1;
      const space = currentTop - host_top;

      if (space >= hostHeight) {
        return currentTop - hostHeight + 1;
      }

      currentTop = host.pos - 1;
    }
    return -1;
  };

  useEffect(() => {
    if (!selectedRack || !checkingRackPos || items.length == 0) return;
    getRack(selectedRack).then((rack) => {
      const hostHeight = (items[0] as Host).height;
      const newPos = isHostFit(hostHeight, rack);
      setSelectedRackPos(newPos);
      setCheckingRackPos(false);
    });
  }, [checkingRackPos, items, selectedRack]);

  const getSelectedParentName = () => {
    let name = "";
    if (selectedDC) {
      const dc = dataCenters.find((dc) => dc.name === selectedDC);
      if (dc) name += dc.name + "/";
    }
    if (selectedRoom && type === "host") {
      const room = rooms.find((room) => room.name === selectedRoom);
      if (room) name += room.name + "/";
    }
    return name;
  };

  // 获取当前选择的目标名称
  const getSelectedDestinationName = () => {
    if (type === "room" && selectedDC) {
      const dc = dataCenters.find((dc) => dc.name === selectedDC);
      return dc?.name || "";
    }
    if (type === "rack" && selectedRoom) {
      const room = rooms.find((room) => room.name === selectedRoom);
      return room?.name || "";
    }
    if (type === "host" && selectedRack) {
      const rack = racks.find((rack) => rack.name === selectedRack);
      return rack?.name || "";
    }
    return "";
  };

  if (items.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Move className="h-5 w-5" /> Move {getTypeName()} "{items[0].name}"
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          {!loadingDestinations && showDCList && (
            <div className="mb-2 text-sm font-medium">Data Centers</div>
          )}
          {!loadingDestinations && showRoomList && (
            <div className="mb-2 text-sm font-medium">{getSelectedParentName()}Rooms</div>
          )}
          {!loadingDestinations && showRackList && (
            <div className="mb-2 text-sm font-medium">{getSelectedParentName()}Racks</div>
          )}
          {loadingDestinations ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              {showDCList && (
                <ul className="space-y-1 p-3">
                  {dataCenters.map((dc) => (
                    <li
                      key={dc.name}
                      className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                        selectedDC === dc.name ? "bg-gray-100" : ""
                      } ${parentDCId === dc.name ? "opacity-50" : ""}`}
                      onClick={() => handleSelectDC(dc.name)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{dc.name}</span>
                        {parentDCId === dc.name && (
                          <span className="ml-auto text-xs text-gray-500">(Current)</span>
                        )}
                      </div>
                      <MoveRight></MoveRight>
                    </li>
                  ))}
                </ul>
              )}

              {showRoomList && (
                <ul className="space-y-1 p-3">
                  {rooms.map((room) => (
                    <li
                      key={room.name}
                      className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                        selectedRoom === room.name ? "bg-gray-100" : ""
                      } ${parentRoomId === room.name ? "opacity-50" : ""}`}
                      onClick={() => handleSelectRoom(room.name)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{room.name}</span>
                        {parentRoomId === room.name && (
                          <span className="ml-auto text-xs text-gray-500">(Current)</span>
                        )}
                      </div>
                      <MoveRight></MoveRight>
                    </li>
                  ))}
                </ul>
              )}

              {showRackList && (
                <ul className="space-y-1 p-3">
                  {racks.map((rack) => (
                    <li
                      key={rack.name}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100",
                        selectedRack === rack.name ? "bg-gray-100" : "",
                        parentRackId === rack.name ? "opacity-50" : "",
                      )}
                      onClick={() => handleSelectRack(rack.name)}
                    >
                      <div className="flex items-center gap-2">
                        {checkingRackPos ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                        ) : (
                          <Home className="h-4 w-4 text-gray-500" />
                        )}
                        <span>{rack.name}</span>
                        {parentRackId === rack.name && (
                          <span className="ml-auto text-xs text-gray-500">(Current)</span>
                        )}
                      </div>
                      <MoveRight></MoveRight>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canMove() ? (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Move <span className="font-bold">{items[0].name}</span> to{" "}
                <span className="font-bold">{getSelectedDestinationName()}</span>
                {type === "host" && selectedRackPos !== null
                  ? ` at position ${selectedRackPos}`
                  : ""}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-red-500">
                {type === "host" && selectedRackPos === -1
                  ? "Host does not fit in the selected rack."
                  : "Please select a destination."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectParentLevel}
            disabled={loading || loadingDestinations || selectedDC === null || type === "room"}
          >
            <MoveLeft></MoveLeft>Parent
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleMove}
            disabled={!canMove() || loading}
            className="gap-1"
          >
            {loading ? "Moving..." : "Move"}
            {!loading && <MoveRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
