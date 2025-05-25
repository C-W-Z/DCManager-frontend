"use client";

import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleRoom, User } from "@/lib/type";
import { RoomRowActions } from "./room-actions";
import { Link } from "react-router-dom";
import Icon from "@/components/icon";

interface RoomColumnsProps {
  onUpdateSuccess: (dc: SimpleRoom) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => void;
  user?: User;
}

function getCommonColumns(): ColumnDef<SimpleRoom>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Room Name
          <Icon id="swap" className="size-4 fill-zinc-600" />
        </Button>
      ),
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return (
          <div className="pl-4 text-left font-medium">
            <Link to={`/overview/room/${name}`} className="hover:underline focus:outline-none">
              {name}
            </Link>
          </div>
        );
      },
    },
    ...["height", "n_racks", "n_hosts"].map((key) => ({
      accessorKey: key,
      header: ({ column }: { column: Column<SimpleRoom> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {key
            .replace("n_", "")
            .replace("_", " ")
            .replace(/^\w/, (c) => c.toUpperCase())}
          <Icon id="swap" className="size-4 fill-zinc-600" />
        </Button>
      ),
      cell: ({ row }: { row: Row<SimpleRoom> }) => {
        const value = parseInt(row.getValue(key));
        return (
          <div className="pl-4 text-left font-medium">
            {key === "height" ? `${value}U` : value}
          </div>
        );
      },
    })),
  ];
}

export function roomColumns({
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
  user,
}: RoomColumnsProps): ColumnDef<SimpleRoom>[] {
  const baseColumns = getCommonColumns();

  // admin 有 actions 欄位
  if (user?.role === "admin") {
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="ml-1 size-4"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="ml-1 size-4"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...baseColumns,
      {
        id: "actions",
        cell: ({ row }) => (
          <RoomRowActions
            row={row}
            onUpdateSuccess={onUpdateSuccess}
            onDeleteSuccess={onDeleteSuccess}
            onMoveSuccess={onMoveSuccess}
          />
        ),
      },
    ];
  }

  return baseColumns;
}
