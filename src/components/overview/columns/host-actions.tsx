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
import { EditHostDialog } from "@/components/dialogs/edit-host-dialog";
import { DeleteConfirmation } from "../../dialogs/delete-confirm";
import { Row } from "@tanstack/react-table";
import type { Host } from "@/lib/type";
import { MoveItemDialog } from "../../dialogs/move-item";

interface HostRowActionsProps {
  row: Row<Host>;
  onUpdateSuccess: (host: Host) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => void;
}

export function HostRowActions({
  row,
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: HostRowActionsProps) {
  const host = row.original;

  const [hostToEdit, setHostToEdit] = useState<Host | null>(null);
  const [hostToMove, setHostToMove] = useState<Host[]>([]);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const handleEdit = (host: Host) => {
    // 先设置为 null，强制 useEffect 在下一次设置时触发
    setHostToEdit(null);
    // 使用 setTimeout 确保在下一个渲染周期设置 hostToEdit
    setTimeout(() => {
      setHostToEdit(host);
    }, 0);
  };

  const handleDelete = (host: Host) => {
    setIdsToDelete([host.name]);
  };

  const handleDeleteSuccess = (ids: string[]) => {
    setIdsToDelete([]);
    onDeleteSuccess(ids);
  };

  const handleMove = (host: Host) => {
    setHostToMove([]);
    setTimeout(() => {
      setHostToMove([host]);
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
          <DropdownMenuItem onClick={() => handleEdit(host)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMove(host)}>
            <Move className="mr-2 h-4 w-4" /> Move
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(host)}>
            <Trash2 className="mr-2 h-4 w-4" /> DELETE
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditHostDialog host={hostToEdit} onUpdateSuccess={onUpdateSuccess} />

      <MoveItemDialog type="host" items={hostToMove} onSuccess={onMoveSuccess} />

      <DeleteConfirmation
        ids={idsToDelete}
        type="host"
        itemNames={idsToDelete && idsToDelete.length === 1 ? [host.name] : undefined}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
