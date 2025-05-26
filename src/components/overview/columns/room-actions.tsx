"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Move, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditRoomDialog } from "../../dialogs/edit-room-dialog";
import { DeleteConfirmation } from "../../dialogs/delete-confirm";
import { Row } from "@tanstack/react-table";
import type { SimpleRoom } from "@/lib/type";
import { MoveItemDialog } from "../../dialogs/move-item";

interface RoomRowActionsProps {
  row: Row<SimpleRoom>;
  onUpdateSuccess: (room: SimpleRoom) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => void;
}

export function RoomRowActions({
  row,
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: RoomRowActionsProps) {
  const room = row.original;

  const [roomToEdit, setRoomToEdit] = useState<SimpleRoom | null>(null);
  const [roomsToMove, setRoomsToMove] = useState<SimpleRoom[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleEditDataCenter = (room: SimpleRoom) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setRoomToEdit(null);
    // 使用 setTimeout 确保在下一个渲染周期设置 roomToEdit
    setTimeout(() => {
      setRoomToEdit(room);
    }, 0);
  };

  const handleDeleteDataCenter = (room: SimpleRoom) => {
    setIdsToDelete([room.name]);
  };

  const handleDeleteSuccess = (ids: string[]) => {
    setIdsToDelete([]);
    onDeleteSuccess(ids);
  };

  const handleMoveRoom = (room: SimpleRoom) => {
    setRoomsToMove([]);
    setTimeout(() => {
      setRoomsToMove([room]);
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
          <DropdownMenuItem onClick={() => handleEditDataCenter(room)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMoveRoom(room)}>
            <Move className="mr-2 h-4 w-4" /> Move
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

      {roomToEdit && <EditRoomDialog room={roomToEdit} onUpdateSuccess={onUpdateSuccess} />}

      <MoveItemDialog type="room" items={roomsToMove} onSuccess={onMoveSuccess} />

      <DeleteConfirmation
        ids={idsToDelete}
        type="room"
        itemNames={idsToDelete && idsToDelete.length === 1 ? [room.name] : undefined}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
