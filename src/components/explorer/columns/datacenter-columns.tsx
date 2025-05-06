"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { SimpleDatacenter } from "@/lib/type";

export function dataCenterColumns(
  onSelect: (dc: SimpleDatacenter) => void,
): ColumnDef<SimpleDatacenter>[] {
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
            Name
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
      accessorKey: "n_rooms",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rooms
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const n_rooms: number = Number.parseInt(row.getValue("n_rooms"));
        return <div className="pl-4 text-left font-medium">{n_rooms}</div>;
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
      cell: ({ row, table }) => {
        const dc = row.original;

        // Access the openDeleteDialog function from table meta
        const { openDeleteDialog } = table.options.meta as {
          openDeleteDialog: (row: unknown, name?: string) => void;
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteDialog(row, dc.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> DELETE
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
