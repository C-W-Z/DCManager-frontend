"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SimpleHost } from "@/lib/type";
import { Link } from "react-router-dom";
import { HostRowActions } from "./host-actions";

interface HostColumnsProps {
  onUpdateSuccess: (host: SimpleHost) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (data: {
    dc_id: string | null;
    room_id: string | null;
    rack_id: string | null;
  }) => void;
}

export function hostColumns({
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: HostColumnsProps): ColumnDef<SimpleHost>[] {
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
            Host Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return (
          <div className="pl-4 text-left font-medium">
            <Link
              to={`/host/${row.original.id}`}
              className="hover:underline focus:outline-none"
            >
              {name}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "service_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Service
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service: string = row.getValue("service_name");
        return <div className="pl-4 text-left font-medium">{service}</div>;
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
      accessorKey: "ip",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            IP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const ip: number = row.getValue("ip");
        return <div className="pl-4 text-left font-medium">{ip}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <HostRowActions
          row={row}
          onUpdateSuccess={onUpdateSuccess}
          onDeleteSuccess={onDeleteSuccess}
          onMoveSuccess={onMoveSuccess}
        />
      ),
    },
  ];
}
