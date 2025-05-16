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
  type Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceColumns } from "./service-column";
import { SimpleService } from "@/lib/type";
import { getAllService } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { DataTablePagination } from "../explorer/data-table-pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddServiceDialog } from "./add-service-dialog";

export default function ServiceTable() {
  const [services, setServices] = useState<SimpleService[]>([]);
  const [loading, setLoading] = useState(false);

  const LoadService = useCallback(() => {
    setLoading(true);
    getAllService()
      .then((serviceList) => {
        setServices(serviceList);
      })
      .catch((error) => {
        console.error("Error fetching all service data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    LoadService();
  }, [LoadService]);

  const handleRefresh = () => {
    LoadService();
  };

  const columns = ServiceColumns();

  return (
    <div className="flex h-full w-full flex-col px-12 pt-12">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <AddServiceDialog />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        getRowId={(row) => row.id}
        loading={loading}
      />
    </div>
  );
}

interface WithID {
  id: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onDeleteRows?: (rows: Row<TData>[]) => void;
  getRowId: (row: TData) => string;
  loading?: boolean;
}

export function DataTable<TData extends WithID, TValue>({
  columns,
  data,
  getRowId,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

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

  return (
    <div>
      <div className="flex items-center justify-between pt-2">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
          disabled={loading}
        />

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
                  className="table-header-row h-12 bg-gray-200 hover:bg-gray-200"
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
    </div>
  );
}
