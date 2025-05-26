import { useState } from "react";
import {
  type ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getGroupedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Host, SimpleRack, SimpleRoom } from "@/lib/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "./data-table-pagination";
import { Move, Trash2 } from "lucide-react";
import { DeleteConfirmation, DeleteType } from "../dialogs/delete-confirm";
import { MoveItemDialog } from "../dialogs/move-item";
import { useUser } from "@/context/use-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WithID {
  name: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId: (row: TData) => string;
  loading?: boolean;
  onMoveSuccess?: (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => void;
  onDeleteSuccess?: (ids: string[]) => void;
  type: DeleteType;
}

export function DataTable<TData extends WithID, TValue>({
  columns,
  data,
  getRowId,
  loading = false,
  onMoveSuccess,
  onDeleteSuccess,
  type,
}: DataTableProps<TData, TValue>) {
  const { user } = useUser();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [multipleIdsToDelete, setMultipleIdsToDelete] = useState<string[]>([]);
  const [itemsToMove, setItemsToMove] = useState<TData[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    getRowId: (row) => getRowId(row),
  });

  const onMoveSelected = () => {
    setItemsToMove([]);
    setTimeout(() => {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      if (selectedRows.length > 0) {
        const items = selectedRows.map((row) => row.original);
        setItemsToMove(items);
      }
    }, 0);
  };

  const handleMoveSuccess = (data: {
    dc_name: string | null;
    room_name: string | null;
    rack_name: string | null;
  }) => {
    if (onMoveSuccess) onMoveSuccess(data);
    table.resetRowSelection();
  };

  const onDeleteSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      const idsToDelete = selectedRows.map((row) => row.original.name);
      setMultipleIdsToDelete(idsToDelete);
    }
  };

  const handleDeleteSuccess = (idsToDelete: string[]) => {
    if (onDeleteSuccess) onDeleteSuccess(idsToDelete);
    setMultipleIdsToDelete([]);
    table.resetRowSelection();
  };

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="px-0 pb-12">
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {type === "host" ? (
            <>
              <Input
                placeholder="Filter by host name..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
                className="w-fit"
                disabled={loading}
              />
              <Select
                value={(table.getColumn("service_name")?.getFilterValue() as string) ?? ""}
                onValueChange={(value) => {
                  if (value !== "All Services")
                    table.getColumn("service_name")?.setFilterValue(value || undefined);
                  else table.getColumn("service_name")?.setFilterValue("");
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-[200px] border-black">
                  <SelectValue placeholder="Filter by service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"All Services"}>All Services</SelectItem>
                  {Array.from(
                    table.getColumn("service_name")?.getFacetedUniqueValues().keys() || [],
                  ).map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Filter by rack name..."
                value={(table.getColumn("rack_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("rack_name")?.setFilterValue(event.target.value)
                }
                className="w-fit"
                disabled={loading}
              />
            </>
          ) : (
            <Input
              placeholder="Filter by name..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
              className="w-fit"
              disabled={loading}
            />
          )}

          {user?.role === "admin" &&
            type !== "datacenter" &&
            type !== "host" &&
            selectedRowCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={onMoveSelected}
                disabled={loading}
              >
                <Move className="h-4 w-4" />
                Move Selected ({selectedRowCount})
              </Button>
            )}

          {user?.role === "admin" && selectedRowCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center gap-1"
              onClick={onDeleteSelected}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selectedRowCount})
            </Button>
          )}
        </div>

        <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={loading} size="sm">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[200px]"
            onPointerDownOutside={(e) => {
              // Prevent closing when clicking on checkboxes
              if ((e.target as HTMLElement).closest('[role="menuitemcheckbox"]')) {
                e.preventDefault();
              }
            }}
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => {
                      column.toggleVisibility(!!value);
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="my-4 h-fit w-full overflow-y-hidden rounded-sm border border-gray-200 bg-white">
        {loading ? (
          <div className="flex h-60 w-full flex-col items-center justify-center gap-2 bg-gray-50">
            <div className="size-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
            <p className="text-sm text-gray-500">Loading data...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 border-b-2 bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-fit">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-12 border-b border-b-gray-200 hover:bg-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination table={table} />

      {user?.role === "admin" && type !== "datacenter" && (
        <MoveItemDialog
          type={type}
          items={itemsToMove as unknown as (SimpleRoom | SimpleRack | Host)[]}
          onSuccess={handleMoveSuccess}
        />
      )}

      {user?.role === "admin" && (
        <DeleteConfirmation
          ids={multipleIdsToDelete}
          type={type}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
