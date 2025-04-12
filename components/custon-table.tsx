"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, FileJson, ArrowDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function CustomDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageSize: pageSize,
        pageIndex: pageIndex,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  const downloadJSON = () => {
    const visibleColumns = table.getVisibleFlatColumns();
    const sortedData = table.getRowModel().rows.map((row) => {
      const rowData: any = {};
      visibleColumns.forEach((column) => {
        const value = row.getValue(column.id);
        if (typeof value === "object" && value !== null) {
          // If the value is an object (like the project column), extract text content
          if ("name" in value) {
            rowData[column.id] = value.name;
          } else {
            rowData[column.id] = JSON.stringify(value);
          }
        } else {
          rowData[column.id] = value;
        }
      });
      return rowData;
    });

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(sortedData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "table_data.json";
    link.click();
  };

  const downloadCSV = () => {
    const visibleColumns = table.getVisibleFlatColumns();
    const headers = visibleColumns.map((col) => col.id);
    const sortedData = table.getRowModel().rows.map((row) => {
      return visibleColumns.map((column) => {
        const value = row.getValue(column.id);
        if (typeof value === "object" && value !== null) {
          // If the value is an object (like the project column), extract text content
          if ("name" in value) {
            return value.name;
          }
          return JSON.stringify(value);
        }
        return value;
      });
    });

    const csvContent = [
      headers.join(","),
      ...sortedData.map((row) => row.join(",")),
    ].join("\n");
    const csvString = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    const link = document.createElement("a");
    link.href = csvString;
    link.download = "table_data.csv";
    link.click();
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter all columns..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm h-8"
        />
        <Button onClick={downloadJSON} className="ml-2 h-8" variant="secondary">
          <FileJson /> Download JSON
        </Button>
        <Button onClick={downloadCSV} className="ml-2 h-8" variant="secondary">
          <FileSpreadsheet /> Download CSV
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="ml-auto h-8">
              Columns <ArrowDownIcon className="" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-[300px] overflow-y-auto"
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            const newPageSize = Number(value);
            setPageSize(newPageSize);
            setPageIndex(0);
            table.setPageSize(newPageSize);
          }}
        >
          <SelectTrigger className="w-[130px] ml-2 h-8">
            <SelectValue placeholder="Select rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 rows</SelectItem>
            <SelectItem value="20">20 rows</SelectItem>
            <SelectItem value="50">50 rows</SelectItem>
            <SelectItem value="100">100 rows</SelectItem>
            <SelectItem value="500">500 rows</SelectItem>
            <SelectItem value="1000">1000 rows</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <div>
          <Table className="block max-h-[440px] overflow-y-auto w-full table-fixed">
            <TableHeader className="sticky top-0 bg-gray-100 dark:bg-[#292524] z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-center w-[1%]">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center w-[1%]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected. Page{" "}
          {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPageIndex = pageIndex - 1;
              setPageIndex(newPageIndex);
              table.setPageIndex(newPageIndex);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPageIndex = pageIndex + 1;
              setPageIndex(newPageIndex);
              table.setPageIndex(newPageIndex);
            }}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
