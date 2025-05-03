"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type DCInfo = {
  id: string;
  name: string;
  default_height: number;
  n_rooms: number;
  n_racks: number;
  n_hosts: number;
};

// export const columns: ColumnDef<DCInfo>[] = [
//   {
//     accessorKey: "name",
//     header: "Name",
//   },
//   {
//     accessorKey: "n_rooms",
//     header: "Rooms",
//   },
//   {
//     accessorKey: "default_height",
//     header: "Default Height",
//   },
//   {
//     accessorKey: "n_racks",
//     header: "Racks",
//   },
//   {
//     accessorKey: "n_hosts",
//     header: "Hosts",
//   },
// ];

export const columns: ColumnDef<DCInfo>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
      )
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name")
      return <div className="pl-4 text-left font-medium">{name}</div>
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
          Room
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const n_rooms: number = parseInt(row.getValue("n_rooms"))
      return <div className="pl-4 text-left font-medium">{n_rooms}</div>
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
      )
    },
    cell: ({ row }) => {
      const n_racks: number = parseInt(row.getValue("n_racks"))
      return <div className="pl-4 pl-4 text-left font-medium">{n_racks}</div>
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
      )
    },
    cell: ({ row }) => {
      const n_hosts: number = parseInt(row.getValue("n_hosts"))
      return <div className="pl-4 text-left font-medium">{n_hosts}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const dcinfo = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(dcinfo.name)}
            >
              Copy Data Center Name
            </DropdownMenuItem>
            <DropdownMenuItem>Modify</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>DELETE</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
