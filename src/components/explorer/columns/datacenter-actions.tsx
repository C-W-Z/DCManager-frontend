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
import { EditDatacenterDialog } from "../dialogs/edit-datacenter";
import { DeleteConfirmation } from "../dialogs/delete-confirm";
import { Row } from "@tanstack/react-table";
import type { SimpleDatacenter } from "@/lib/type";

interface DCRowActionsProps {
  row: Row<SimpleDatacenter>;
  onUpdateSuccess: (dc: SimpleDatacenter) => void;
  onDeleteSuccess: (ids: string[]) => void;
}

export function DatacenterRowActions({
  row,
  onUpdateSuccess,
  onDeleteSuccess,
}: DCRowActionsProps) {
  const dc = row.original;

  const [currentDC, setCurrentDC] = useState<SimpleDatacenter | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleEditDataCenter = (dc: SimpleDatacenter) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setCurrentDC(null);

    // 使用 setTimeout 确保在下一个渲染周期设置 currentDC
    setTimeout(() => {
      setCurrentDC(dc);
    }, 0);
  };

  const handleDeleteDataCenter = (dc: SimpleDatacenter) => {
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
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDeleteDataCenter(dc)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> DELETE
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 编辑对话框 */}
      <EditDatacenterDialog datacenter={currentDC} onUpdateSuccess={onUpdateSuccess} />

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
