"use client";

import type { Column, ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleDatacenter, User } from "@/lib/type";
import { DatacenterRowActions } from "./datacenter-actions";
import { Link } from "react-router-dom";
import Icon from "@/components/icon";

interface DataCenterColumnsProps {
  onUpdateSuccess: (dc: SimpleDatacenter) => void;
  onDeleteSuccess: (ids: string[]) => void;
  user?: User;
}

function getCommonColumns(): ColumnDef<SimpleDatacenter>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          DC Name
          <Icon id="swap" className="size-4 fill-zinc-600" />
        </Button>
      ),
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return (
          <div className="pl-4 text-left font-bold">
            <Link to={`/overview/dc/${name}`} className="hover:underline focus:outline-none">
              {name}
            </Link>
          </div>
        );
      },
    },
    ...["height", "n_rooms", "n_racks", "n_hosts"].map((key) => ({
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
          <Icon id="swap" className="size-4 fill-zinc-600" />
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
  onUpdateSuccess,
  onDeleteSuccess,
  user,
}: DataCenterColumnsProps): ColumnDef<SimpleDatacenter>[] {
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
