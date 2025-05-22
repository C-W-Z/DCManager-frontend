"use client";

import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleDatacenter, User } from "@/lib/type";
import { DatacenterRowActions } from "./datacenter-actions";

interface DataCenterColumnsProps {
  onSelect: (room: SimpleDatacenter) => void;
  onUpdateSuccess: (dc: SimpleDatacenter) => void;
  onDeleteSuccess: (ids: string[]) => void;
  user?: User;
}

function getCommonColumns(
  onSelect: (room: SimpleDatacenter) => void,
): ColumnDef<SimpleDatacenter>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          DC Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="pl-4 text-left font-medium">
          <button
            className="hover:underline focus:outline-none"
            onClick={() => onSelect(row.original)}
          >
            {row.getValue("name")}
          </button>
        </div>
      ),
    },
    ...["n_rooms", "height", "n_racks", "n_hosts"].map((key) => ({
      accessorKey: key,
      header: ({ column }: { column: Column<SimpleDatacenter> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {key
            .replace("n_", "")
            .replace("_", " ")
            .replace(/^\w/, (c) => c.toUpperCase())}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: Row<SimpleDatacenter> }) => {
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

export function dataCenterColumns({
  onSelect,
  onUpdateSuccess,
  onDeleteSuccess,
  user,
}: DataCenterColumnsProps): ColumnDef<SimpleDatacenter>[] {
  const baseColumns = getCommonColumns(onSelect);

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
      ...baseColumns,
      {
        id: "actions",
        cell: ({ row }) => (
          <DatacenterRowActions
            row={row}
            onUpdateSuccess={onUpdateSuccess}
            onDeleteSuccess={onDeleteSuccess}
          />
        ),
      },
    ];
  }

  // normal 使用者就只回傳基礎欄位
  return baseColumns;
}
