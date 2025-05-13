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
import type { SimpleDatacenter, SimpleRoom } from "@/lib/type";
import { getAllDC, getDC, modifyRoom, modifyRack } from "@/lib/api";

type MoveItemType = "room" | "rack";

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
  const [selectedDC, setSelectedDC] = useState<string | null>(null);
  const [rooms, setRooms] = useState<SimpleRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loadingDestinations, setLoadingDestinations] = useState(false);

  // 加载指定数据中心的房间
  const loadRooms = useCallback(
    async (dcId: string) => {
      setLoadingDestinations(true);
      try {
        const dc = await getDC(dcId);
        setRooms(dc.rooms);

        // 如果是移动 rack 且有当前父级 ID (room)，预选当前 room
        if (type === "rack" && currentParentId) {
          setSelectedRoom(currentParentId);
        }
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoadingDestinations(false);
      }
    },
    [currentParentId, type],
  );

  // 加载所有数据中心
  const loadDataCenters = useCallback(async () => {
    setLoadingDestinations(true);
    try {
      const dcs = await getAllDC();
      setDataCenters(dcs);

      // 如果是移动 rack 且有当前父级 ID (room)，找到对应的 DC
      if (type === "rack" && currentParentId) {
        // 查找包含当前 room 的 DC
        for (const dc of dcs) {
          const dcDetails = await getDC(dc.id);
          const roomExists = dcDetails.rooms.some((room) => room.id === currentParentId);
          if (roomExists) {
            setSelectedDC(dc.id);
            loadRooms(dc.id);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error loading data centers:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, [currentParentId, loadRooms, type]);

  // 当 itemId 变化时，如果有值则打开对话框
  useEffect(() => {
    if (itemId) {
      setIsOpen(true);
      loadDataCenters();
    } else {
      // 重置选择状态
      setSelectedDC(null);
      setSelectedRoom(null);
    }
  }, [itemId, loadDataCenters]);

  // 处理数据中心选择
  const handleSelectDC = (dcId: string) => {
    setSelectedDC(dcId);
    setSelectedRoom(null);
    loadRooms(dcId);
  };

  // 处理房间选择
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoom(roomId);
  };

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
    return type === "room" ? "数据中心" : "房间";
  };

  // 检查是否可以移动
  const canMove = () => {
    if (type === "room") return !!selectedDC && selectedDC !== currentParentId;
    if (type === "rack") return !!selectedRoom && selectedRoom !== currentParentId;
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

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">选择目标{getDestinationTypeName()}</p>
          </div>

          {loadingDestinations ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto rounded-md border">
              {type === "room" ? (
                // 数据中心列表（用于移动房间）
                <ul className="divide-y">
                  {dataCenters.map((dc) => (
                    <li
                      key={dc.id}
                      className={`flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-100 ${
                        selectedDC === dc.id ? "bg-gray-100" : ""
                      } ${currentParentId === dc.id ? "opacity-50" : ""}`}
                      onClick={() => handleSelectDC(dc.id)}
                    >
                      <Home className="h-4 w-4 text-gray-500" />
                      <span>{dc.name}</span>
                      {currentParentId === dc.id && (
                        <span className="ml-auto text-xs text-gray-500">(当前)</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                // 数据中心和房间列表（用于移动机架）
                <div>
                  {/* 数据中心选择 */}
                  <div className="border-b p-3">
                    <div className="mb-2 text-sm font-medium">数据中心</div>
                    <ul className="space-y-1">
                      {dataCenters.map((dc) => (
                        <li
                          key={dc.id}
                          className={`flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100 ${
                            selectedDC === dc.id ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleSelectDC(dc.id)}
                        >
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>{dc.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 房间选择 */}
                  {selectedDC && (
                    <div className="p-3">
                      <div className="mb-2 text-sm font-medium">房间</div>
                      <ul className="space-y-1">
                        {rooms.map((room) => (
                          <li
                            key={room.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-100 ${
                              selectedRoom === room.id ? "bg-gray-100" : ""
                            } ${currentParentId === room.id ? "opacity-50" : ""}`}
                            onClick={() => handleSelectRoom(room.id)}
                          >
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-xs">
                              R
                            </div>
                            <span>{room.name}</span>
                            {currentParentId === room.id && (
                              <span className="ml-auto text-xs text-gray-500">(当前)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
            取消
          </Button>
          <Button
            type="button"
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
