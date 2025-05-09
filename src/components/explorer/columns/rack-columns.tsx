"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SimpleRack } from "@/lib/type";

export function rackColumns(onSelect: (rack: SimpleRack) => void): ColumnDef<SimpleRack>[] {
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
            Rack Name
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
      id: "capacity",
      accessorFn: (row) => row.height - row.capacity,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Usage/Capacity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const capacity: number = row.original.capacity;
        const height: number = row.original.height;
        return (
          <div className="pl-4 text-left font-medium">
            {height - capacity}/{height}U
          </div>
        );
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
        const rack = row.original;

        // Access the functions from table meta
        const { openDeleteDialog, openEditDialog } = table.options.meta as {
          openDeleteDialog: (row: unknown, name?: string) => void;
          openEditDialog: (row: SimpleRack) => void;
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
              <DropdownMenuItem onClick={() => openEditDialog(rack)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => openDeleteDialog(row, rack.name)}
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
