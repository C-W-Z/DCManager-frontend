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
import { DeleteConfirmation, DeleteType } from "./dialogs/delete-confirm";
import { MoveItemDialog } from "./dialogs/move-item";
import { useUser } from "@/context/use-user";

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
    <div className="px-0">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
            disabled={loading}
          />

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
            <Button variant="outline" disabled={loading}>
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

      <div className="modern-table">
        {loading ? (
          <div className="flex h-40 w-full items-center justify-center rounded-lg border bg-gray-50">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
              <p className="text-sm text-gray-500">Loading data...</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="table-header-row bg-gray-200 hover:bg-gray-200"
                >
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={`${index === 0 ? "first-header-cell" : ""} ${
                          index === headerGroup.headers.length - 1 ? "last-header-cell" : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={`table-data-row ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    {row.getVisibleCells().map((cell, cellIndex) => (
                      <TableCell
                        key={cell.id}
                        className={`${cellIndex === 0 ? "first-cell" : ""} ${
                          cellIndex === row.getVisibleCells().length - 1 ? "last-cell" : ""
                        }`}
                      >
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
