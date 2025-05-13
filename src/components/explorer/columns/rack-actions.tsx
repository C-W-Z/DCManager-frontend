"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, MoveRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRackDialog } from "../dialogs/edit-rack";
import { DeleteConfirmation } from "../dialogs/delete-confirm";
import { Row } from "@tanstack/react-table";
import type { SimpleRack } from "@/lib/type";
import { MoveItemDialog } from "../dialogs/move-item";

interface RackRowActionsProps {
  row: Row<SimpleRack>;
  onUpdateSuccess: (rack: SimpleRack) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess?: () => void;
}

export function RackRowActions({
  row,
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: RackRowActionsProps) {
  const rack = row.original;

  const [currentRack, setCurrentRack] = useState<SimpleRack | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const [rackToMove, setRackToMove] = useState<string | null>(null);

  const handleEditDataCenter = (rack: SimpleRack) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setCurrentRack(null);
    // 使用 setTimeout 确保在下一个渲染周期设置 currentRack
    setTimeout(() => {
      setCurrentRack(rack);
    }, 0);
  };

  const handleDeleteDataCenter = (rack: SimpleRack) => {
    setIdsToDelete([rack.id]);
  };

  const handleDeleteSuccess = (ids: string[]) => {
    setIdsToDelete([]);
    onDeleteSuccess(ids);
  };

  const handleMoveRack = (rack: SimpleRack) => {
    setRackToMove(null);
    setTimeout(() => {
      setRackToMove(rack.id);
    }, 0);
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
          <DropdownMenuItem onClick={() => handleEditDataCenter(rack)}>
            <Edit className="mr-2 h-4 w-4" /> EDIT
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMoveRack(rack)}>
            <MoveRight className="mr-2 h-4 w-4" /> Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDeleteDataCenter(rack)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> DELETE
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRackDialog rack={currentRack} onUpdateSuccess={onUpdateSuccess} />

      <DeleteConfirmation
        ids={idsToDelete}
        type="rack"
        itemNames={idsToDelete && idsToDelete.length === 1 ? [rack.name] : undefined}
        onSuccess={handleDeleteSuccess}
      />

      <MoveItemDialog
        type="rack"
        itemId={rackToMove}
        itemName={rack.name}
        currentParentId={rack.room_id}
        onSuccess={onMoveSuccess}
      />
    </>
  );
}
