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
import type { SimpleDatacenter, SimpleHost, SimpleRack, SimpleRoom } from "@/lib/type";
import {
  getAllDC,
  getDC,
  modifyRoom,
  modifyRack,
  getRoom,
  getRack,
  modifyHost,
} from "@/lib/api";

type MoveItemType = "room" | "rack" | "host";

interface MoveItemDialogProps {
  type: MoveItemType;
  items: (SimpleRoom | SimpleRack | SimpleHost)[];
  onSuccess?: (ids: string[]) => void;
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
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  const loadRacksByRoomId = useCallback(async (room_id: string) => {
    setLoadingDestinations(true);
    try {
      const room = await getRoom(room_id);
      setRacks(room.racks);
    } catch (error) {
      console.error("Error loading racks:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  // 加载指定数据中心的房间
  const loadRoomsByDCId = useCallback(async (dc_id: string) => {
    setLoadingDestinations(true);
    try {
      const dc = await getDC(dc_id);
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
        setSelectedDC((items[0] as SimpleRoom).dc_id);
        break;
      }
      case "rack": {
        try {
          const room = await getRoom((items[0] as SimpleRack).room_id);
          if (room.id !== (items[0] as SimpleRack).room_id)
            console.error("room.id !== item.room_id");
          loadRoomsByDCId(room.dc_id);
          setSelectedDC(room.dc_id);
          setSelectedRoom(room.id);
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
        break;
      }
      case "host": {
        try {
          const rack = await getRack((items[0] as SimpleHost).rack_id);
          if (rack.id !== (items[0] as SimpleHost).rack_id)
            console.error("rack.id !== item.rack_id");
          loadRoomsByDCId(rack.dc_id);
          loadRacksByRoomId(rack.room_id);
          setSelectedDC(rack.dc_id);
          setSelectedRoom(rack.room_id);
          setSelectedRack(rack.id);
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
  const handleSelectDC = (dc_id: string) => {
    setSelectedDC(dc_id);
    setSelectedRoom(null);
    loadRoomsByDCId(dc_id);
  };

  // 处理房间选择
  const handleSelectRoom = (room_id: string) => {
    setSelectedRoom(room_id);
    loadRacksByRoomId(room_id);
  };

  const handleSelectRack = (rack_id: string) => {
    setSelectedRack(rack_id);
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
      return items.map((item) => modifyRoom(item.id, { dc_id: selectedDC }));
    if (type === "rack" && selectedRoom)
      return items.map((item) => modifyRack(item.id, { room_id: selectedRoom }));
    if (type === "host" && selectedRack)
      return items.map((item) => modifyHost(item.id, { rack_id: selectedRack }));
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
      if (allSuccessful && onSuccess) onSuccess(items.map((item) => item.id));
      else console.error("Some move operations failed");
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
    if (type === "room") return !!selectedDC && selectedDC !== (items[0] as SimpleRoom).dc_id;
    if (type === "rack")
      return !!selectedRoom && selectedRoom !== (items[0] as SimpleRack).room_id;
    if (type === "host")
      return !!selectedRack && selectedRack !== (items[0] as SimpleHost).rack_id;
    return false;
  };

  const getSelectedParentName = () => {
    let name = "";
    if (selectedDC) {
      const dc = dataCenters.find((dc) => dc.id === selectedDC);
      if (dc) name += dc.name + "/";
    }
    if (selectedRoom && type === "host") {
      const room = rooms.find((room) => room.id === selectedRoom);
      if (room) name += room.name + "/";
    }
    return name;
  };

  // 获取当前选择的目标名称
  const getSelectedDestinationName = () => {
    if (type === "room" && selectedDC) {
      const dc = dataCenters.find((dc) => dc.id === selectedDC);
      return dc?.name || "";
    }
    if (type === "rack" && selectedRoom) {
      const room = rooms.find((room) => room.id === selectedRoom);
      return room?.name || "";
    }
    if (type === "host" && selectedRack) {
      const rack = racks.find((rack) => rack.id === selectedRack);
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
                      key={dc.id}
                      className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                        selectedDC === dc.id ? "bg-gray-100" : ""
                      } ${(items[0] as SimpleRoom).dc_id === dc.id ? "opacity-50" : ""}`}
                      onClick={() => handleSelectDC(dc.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{dc.name}</span>
                        {(items[0] as SimpleRoom).dc_id === dc.id && (
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
                      key={room.id}
                      className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                        selectedRoom === room.id ? "bg-gray-100" : ""
                      } ${(items[0] as SimpleRack).room_id === room.id ? "opacity-50" : ""}`}
                      onClick={() => handleSelectRoom(room.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{room.name}</span>
                        {(items[0] as SimpleRack).room_id === room.id && (
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
                      key={rack.id}
                      className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                        selectedRoom === rack.id ? "bg-gray-100" : ""
                      } ${(items[0] as SimpleHost).rack_id === rack.id ? "opacity-50" : ""}`}
                      onClick={() => handleSelectRack(rack.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>{rack.name}</span>
                        {(items[0] as SimpleHost).rack_id === rack.id && (
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

          {canMove() && (
            <div className="mt-4">
              <p className="text-sm font-medium">
                Move <span className="font-bold">{items[0].name}</span> to{" "}
                <span className="font-bold">{getSelectedDestinationName()}</span>
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
