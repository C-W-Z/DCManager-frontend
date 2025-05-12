"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRoomDialog } from "../dialogs/edit-room";
import { DeleteConfirmation } from "../dialogs/delete-confirm";
import { Row } from "@tanstack/react-table";
import type { SimpleRoom } from "@/lib/type";

interface RoomRowActionsProps {
  row: Row<SimpleRoom>;
  onUpdateSuccess: (dc: SimpleRoom) => void;
  onDeleteSuccess: (ids: string[]) => void;
}

export function RoomRowActions({ row, onUpdateSuccess, onDeleteSuccess }: RoomRowActionsProps) {
  const dc = row.original;

  const [currentDC, setCurrentDC] = useState<SimpleRoom | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleEditDataCenter = (dc: SimpleRoom) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setCurrentDC(null);

    // 使用 setTimeout 确保在下一个渲染周期设置 currentDC
    setTimeout(() => {
      setCurrentDC(dc);
    }, 0);
  };

  const handleDeleteDataCenter = (dc: SimpleRoom) => {
    // 设置要删除的 ID
    setIdsToDelete([dc.id]);
  };

  const handleDeleteSuccess = (ids: string[]) => {
    // 清除要删除的 ID
    setIdsToDelete([]);
    // 调用父组件的成功回调
    onDeleteSuccess(ids);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEditDataCenter(dc)}>
            <Edit className="mr-2 h-4 w-4" /> 編輯
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDeleteDataCenter(dc)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> 刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 编辑对话框 */}
      <EditRoomDialog room={currentDC} onUpdateSuccess={onUpdateSuccess} />

      {/* 删除确认对话框 */}
      <DeleteConfirmation
        ids={idsToDelete}
        type="datacenter"
        itemNames={idsToDelete && idsToDelete.length === 1 ? [dc.name] : undefined}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
