"use client";

import { useState } from "react";
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
import { EditDatacenterDialog } from "../dialogs/edit-datacenter";
import { DeleteConfirmation } from "../dialogs/delete-confirm";

export function dataCenterColumns(
  onSelect: (dc: SimpleDatacenter) => void,
  onUpdate: (dc: SimpleDatacenter | null) => void,
  onDeleteSuccess?: (ids: string[]) => void,
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
      cell: ({ row }) => {
        const dc = row.original;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [currentDC, setCurrentDC] = useState<SimpleDatacenter | null>(null);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

        const handleEditDataCenter = (dc: SimpleDatacenter) => {
          // 先设置为 null，强制 useEffect 在下一次设置时触发
          setCurrentDC(null);

          // 使用 setTimeout 确保在下一个渲染周期设置 currentDC
          setTimeout(() => {
            setCurrentDC(dc);
          }, 0);
        };

        const handleDeleteDataCenter = (dc: SimpleDatacenter) => {
          // 设置要删除的 ID
          setIdsToDelete([dc.id]);
        };

        const handleDeleteSuccess = (ids: string[]) => {
          // 清除要删除的 ID
          setIdsToDelete([]);
          // 调用父组件的成功回调
          if (onDeleteSuccess) {
            onDeleteSuccess(ids);
          }
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
                <DropdownMenuItem onClick={() => handleEditDataCenter(dc)}>
                  <Edit className="mr-2 h-4 w-4" /> 編輯
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteDataCenter(dc)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 刪除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 编辑对话框 */}
            <EditDatacenterDialog datacenter={currentDC} onUpdate={onUpdate} />

            {/* 删除确认对话框 */}
            <DeleteConfirmation
              ids={idsToDelete}
              type="datacenter"
              itemNames={idsToDelete && idsToDelete.length === 1 ? [dc.name] : undefined}
              onSuccess={handleDeleteSuccess}
            />
          </>
        );
      },
    },
  ];
}
