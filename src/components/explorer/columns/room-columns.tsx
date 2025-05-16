"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleRoom } from "@/lib/type";
import { RoomRowActions } from "./room-actions";

interface RoomColumnsProps {
  onSelect: (room: SimpleRoom) => void;
  onUpdateSuccess: (dc: SimpleRoom) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (data: {
    dc_id: string | null;
    room_id: string | null;
    rack_id: string | null;
  }) => void;
}

export function roomColumns({
  onSelect,
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: RoomColumnsProps): ColumnDef<SimpleRoom>[] {
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
          className="ml-1 h-5 w-5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="ml-1 h-5 w-5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Room Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return (
          <div className="pl-4 text-left font-medium">
            <button
              className="hover:underline focus:outline-none"
              onClick={() => onSelect(row.original)}
            >
              {name}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "height",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Height
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const height: number = Number.parseInt(row.getValue("height"));
        return <div className="pl-4 text-left font-medium">{height}U</div>;
      },
    },
    {
      accessorKey: "n_racks",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Racks
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const n_racks: number = Number.parseInt(row.getValue("n_racks"));
        return <div className="pl-4 text-left font-medium">{n_racks}</div>;
      },
    },
    {
      accessorKey: "n_hosts",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Hosts
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const n_hosts: number = Number.parseInt(row.getValue("n_hosts"));
        return <div className="pl-4 text-left font-medium">{n_hosts}</div>;
      },
    },
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
