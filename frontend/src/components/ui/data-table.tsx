import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Download, Upload, GripHorizontal, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { SearchBar } from '@/components/ui/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
  enableImport?: boolean;
  onImport?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: TData) => void;
  bulkActions?: React.ReactNode;
  className?: string;
}

function exportToCsv<TData>(
  rows: TData[],
  columns: ColumnDef<TData, unknown>[],
  filename: string
) {
  const exportableColumns = columns.filter(
    (col) => 'accessorKey' in col && col.accessorKey
  ) as Array<ColumnDef<TData, unknown> & { accessorKey: string; header?: string }>;

  const headers = exportableColumns.map(
    (col) => (typeof col.header === 'string' ? col.header : col.accessorKey) as string
  );

  const csvRows = rows.map((row) =>
    exportableColumns
      .map((col) => {
        const value = (row as Record<string, unknown>)[col.accessorKey];
        const cell = value == null ? '' : String(value);
        return `"${cell.replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  searchKey,
  searchPlaceholder = 'Search…',
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableExport = false,
  exportFilename = 'export.csv',
  enableImport = false,
  onImport,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your search or filters.',
  onRowClick,
  bulkActions,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [density, setDensity] = React.useState<'compact' | 'standard' | 'comfortable'>('standard');

  const getDensityClass = () => {
    switch (density) {
      case 'compact': return 'py-1 px-4';
      case 'comfortable': return 'py-4 px-4';
      default: return 'py-2.5 px-4';
    }
  };

  const selectionColumn: ColumnDef<TData, unknown> = {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = React.useMemo(
    () => (enableRowSelection ? [selectionColumn, ...columns] : columns),
    [columns, enableRowSelection]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    enableColumnResizing: true,
    enableMultiSort: true,
    columnResizeMode: 'onChange',
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {searchKey ? (
            <SearchBar
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(value) => table.getColumn(searchKey)?.setFilterValue(value)}
              placeholder={searchPlaceholder}
            />
          ) : (
            <SearchBar
              value={globalFilter}
              onChange={setGlobalFilter}
              placeholder={searchPlaceholder}
            />
          )}
          {selectedCount > 0 && bulkActions && (
            <div className="flex items-center gap-2">{bulkActions}</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              icon={<Download />}
              onClick={() =>
                exportToCsv(
                  table.getFilteredRowModel().rows.map((r) => r.original),
                  tableColumns as ColumnDef<TData, unknown>[],
                  exportFilename
                )
              }
            >
              Export
            </Button>
          )}
          {enableImport && (
            <Button variant="outline" size="sm" icon={<Upload />} onClick={onImport}>
              Import
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" icon={<LayoutList />}>
                Density
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem checked={density === 'compact'} onCheckedChange={() => setDensity('compact')}>
                Compact
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={density === 'standard'} onCheckedChange={() => setDensity('standard')}>
                Standard
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={density === 'comfortable'} onCheckedChange={() => setDensity('comfortable')}>
                Comfortable
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-300">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted/30 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "relative text-left align-middle text-[13px] font-medium text-muted-foreground uppercase tracking-wider group",
                        getDensityClass()
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                      
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border opacity-0 hover:opacity-100 ${
                            header.column.getIsResizing() ? 'bg-primary opacity-100' : ''
                          }`}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {tableColumns.map((_, j) => (
                      <td key={j} className={getDensityClass()}>
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="p-0">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'border-b border-border transition-all duration-normal hover:bg-muted/30 data-[state=selected]:bg-primary/5',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn("align-middle", getDensityClass())}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Spinner />
          </div>
        )}
      </div>

      {!isLoading && table.getFilteredRowModel().rows.length > 0 && (
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          pageSize={table.getState().pagination.pageSize}
          totalItems={table.getFilteredRowModel().rows.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

export type { ColumnDef };
