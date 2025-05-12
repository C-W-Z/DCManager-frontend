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
  onUpdateSuccess: (room: SimpleRoom) => void;
  onDeleteSuccess: (ids: string[]) => void;
}

export function RoomRowActions({
  row,
  onUpdateSuccess,
  onDeleteSuccess,
}: RoomRowActionsProps) {
  const room = row.original;

  const [currentRoom, setCurrentRoom] = useState<SimpleRoom | null>(null);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleEditDataCenter = (room: SimpleRoom) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setCurrentRoom(null);
    // 使用 setTimeout 确保在下一个渲染周期设置 currentRoom
    setTimeout(() => {
      setCurrentRoom(room);
    }, 0);
  };

  const handleDeleteDataCenter = (room: SimpleRoom) => {
    setIdsToDelete([room.id]);
  };

  const handleDeleteSuccess = (ids: string[]) => {
    setIdsToDelete([]);
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
          <DropdownMenuItem onClick={() => handleEditDataCenter(room)}>
            <Edit className="mr-2 h-4 w-4" /> EDIT
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDeleteDataCenter(room)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> DELETE
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditRoomDialog room={currentRoom} onUpdateSuccess={onUpdateSuccess} />

      <DeleteConfirmation
        ids={idsToDelete}
        type="room"
        itemNames={idsToDelete && idsToDelete.length === 1 ? [room.name] : undefined}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
