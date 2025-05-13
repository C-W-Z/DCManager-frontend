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
import { MoveRight, Home } from "lucide-react";
import type { SimpleDatacenter, SimpleRack, SimpleRoom } from "@/lib/type";
import { getAllDC, getDC, modifyRoom, modifyRack, getRoom, getRack } from "@/lib/api";

type MoveItemType = "room" | "rack" | "host";

interface MoveItemDialogProps {
  type: MoveItemType;
  itemId: string | null;
  itemName?: string;
  currentParentId?: string;
  onSuccess?: () => void;
}

export function MoveItemDialog({
  type,
  itemId,
  itemName,
  currentParentId,
  onSuccess,
}: MoveItemDialogProps) {
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

  const loadParentLayer = useCallback(async () => {
    loadDataCenters();
    switch (type) {
      case "room": {
        if (currentParentId) setSelectedDC(currentParentId);
        break;
      }
      case "rack": {
        if (!currentParentId) break;
        try {
          const room = await getRoom(currentParentId);
          if (room.id !== currentParentId) console.error("room.id !== currentParentId");
          loadRoomsByDCId(room.dc_id);
          setSelectedDC(room.dc_id);
          setSelectedRoom(room.id);
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
        break;
      }
      case "host": {
        if (!currentParentId) break;
        try {
          const rack = await getRack(currentParentId);
          if (rack.id !== currentParentId) console.error("rack.id !== currentParentId");
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
  }, [type, loadDataCenters, currentParentId, loadRoomsByDCId, loadRacksByRoomId]);

  // 当 itemId 变化时，如果有值则打开对话框
  useEffect(() => {
    if (itemId) {
      setIsOpen(true);
      loadParentLayer();
    } else {
      // 重置选择状态
      setSelectedDC(null);
      setSelectedRoom(null);
      setSelectedRack(null);
    }
  }, [itemId, loadParentLayer]);

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

  const handleSelectUpperLayer = () => {
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

  // 处理移动确认
  const handleMove = async () => {
    if (!itemId) return;

    setLoading(true);
    try {
      if (type === "room" && selectedDC) {
        // 移动房间到新的数据中心
        await modifyRoom(itemId, { dc_id: selectedDC });
      } else if (type === "rack" && selectedRoom) {
        // 移动机架到新的房间
        await modifyRack(itemId, { room_id: selectedRoom });
      }

      // 关闭对话框并通知成功
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error moving ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // 获取目标类型的显示名称
  const getDestinationTypeName = () => {
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

  // 检查是否可以移动
  const canMove = () => {
    if (type === "room") return !!selectedDC && selectedDC !== currentParentId;
    if (type === "rack") return !!selectedRoom && selectedRoom !== currentParentId;
    if (type === "host") return !!selectedRack && selectedRack !== currentParentId;
    return false;
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <MoveRight className="h-5 w-5" /> 移动{type === "room" ? "房间" : "机架"}{" "}
            {itemName}
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Choose {getDestinationTypeName()}</p>
          </div>

          {loadingDestinations ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              {showDCList && (
                <div className="p-3">
                  <div className="mb-2 text-sm font-medium">Data Centers</div>
                  <ul className="space-y-1">
                    {dataCenters.map((dc) => (
                      <li
                        key={dc.id}
                        className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                          selectedDC === dc.id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => handleSelectDC(dc.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>{dc.name}</span>
                          {currentParentId === dc.id && (
                            <span className="ml-auto text-xs text-gray-500">(Current)</span>
                          )}
                        </div>
                        <MoveRight></MoveRight>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showRoomList && (
                <div className="p-3">
                  <div className="mb-2 text-sm font-medium">Rooms</div>
                  <ul className="space-y-1">
                    {rooms.map((room) => (
                      <li
                        key={room.id}
                        className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                          selectedRoom === room.id ? "bg-gray-100" : ""
                        } ${currentParentId === room.id ? "opacity-50" : ""}`}
                        onClick={() => handleSelectRoom(room.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>{room.name}</span>
                          {currentParentId === room.id && (
                            <span className="ml-auto text-xs text-gray-500">(Current)</span>
                          )}
                        </div>
                        <MoveRight></MoveRight>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {showRackList && (
                <div className="p-3">
                  <div className="mb-2 text-sm font-medium">Racks</div>
                  <ul className="space-y-1">
                    {racks.map((rack) => (
                      <li
                        key={rack.id}
                        className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-gray-100 ${
                          selectedRoom === rack.id ? "bg-gray-100" : ""
                        } ${currentParentId === rack.id ? "opacity-50" : ""}`}
                        onClick={() => handleSelectRack(rack.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>{rack.name}</span>
                          {currentParentId === rack.id && (
                            <span className="ml-auto text-xs text-gray-500">(Current)</span>
                          )}
                        </div>
                        <MoveRight></MoveRight>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {canMove() && (
            <div className="mt-4 rounded-md bg-gray-50 p-3">
              <p className="text-sm">
                将{type === "room" ? "房间" : "机架"}{" "}
                <span className="font-medium">{itemName}</span> 移动到{" "}
                <span className="font-medium">{getSelectedDestinationName()}</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectUpperLayer}
            disabled={loading || loadingDestinations || selectedDC === null}
          >
            上一層
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleMove}
            disabled={!canMove() || loading}
            className="gap-1"
          >
            {loading ? "移动中..." : "移动"}
            {!loading && <MoveRight className="h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
