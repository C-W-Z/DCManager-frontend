"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Host } from "@/lib/type";
import { Link } from "react-router-dom";
import { HostRowActions } from "./host-actions";
import { cn } from "@/lib/utils";
import Icon from "@/components/icon";

interface HostColumnsProps {
  onUpdateSuccess: (host: Host) => void;
  onDeleteSuccess: (ids: string[]) => void;
  onMoveSuccess: (new_rack_name: string) => void;
}

export function hostColumns({
  onUpdateSuccess,
  onDeleteSuccess,
  onMoveSuccess,
}: HostColumnsProps): ColumnDef<Host>[] {
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
    {
      accessorKey: "running",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <Icon id="swap" className="size-4 fill-zinc-600" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const running: boolean = row.original.running;
        return (
          <div className="item-center flex">
            <div
              className={cn(
                "mr-2 ml-1 h-3 w-3 self-center rounded-full",
                running ? "bg-green-600" : "bg-red-400",
              )}
            ></div>
            {running ? "Running" : "Stopped"}
          </div>
        );
      },
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
            <Icon id="swap" className="size-4 fill-zinc-600" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name: string = row.getValue("name");
        return (
          <div className="flex pl-4 text-left font-bold">
            <Link to={`/host/${name}`} className="hover:underline focus:outline-none">
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
            <Icon id="swap" className="size-4 fill-zinc-600" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const service: string = row.getValue("service_name");
        return (
          <div className="pl-4 text-left font-medium">
            <Link to={`/service/${service}`} className="hover:underline focus:outline-none">
              {service}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "rack_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Rack Name
            <Icon id="swap" className="size-4 fill-zinc-600" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const rackName: string = row.getValue("rack_name");
        return (
          <div className="pl-4 text-left font-medium">
            <Link to={`/rack/${rackName}`} className="hover:underline focus:outline-none">
              {rackName || "N/A"}
            </Link>
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
            <Icon id="swap" className="size-4 fill-zinc-600" />
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
            <Icon id="swap" className="size-4 fill-zinc-600" />
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
