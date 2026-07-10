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
import { ChevronDown, Download, Upload, LayoutList, SlidersHorizontal, CheckSquare } from 'lucide-react';
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
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;
  advancedFilters?: React.ReactNode;
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
  advancedFilters,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [density, setDensity] = React.useState<'compact' | 'standard' | 'comfortable'>('standard');

  const tbodyRef = React.useRef<HTMLTableSectionElement>(null);

  const getDensityClass = () => {
    switch (density) {
      case 'compact': return 'py-1.5 px-3';
      case 'comfortable': return 'py-4 px-4';
      default: return 'py-2.5 px-3.5';
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
        className="border-white/20 bg-slate-950/50 data-[state=checked]:bg-white data-[state=checked]:text-slate-950"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
        className="border-white/20 bg-slate-950/50 data-[state=checked]:bg-white data-[state=checked]:text-slate-950"
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>, rowIndex: number, original: TData) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick?.(original);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = tbodyRef.current?.children[rowIndex + 1] as HTMLElement | undefined;
      nextRow?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = tbodyRef.current?.children[rowIndex - 1] as HTMLElement | undefined;
      prevRow?.focus();
    }
  };

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
          {advancedFilters}
        </div>

        <div className="flex items-center gap-2">
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-3.5 w-3.5" />}
              className="border-white/10 hover:bg-white/5 text-xs text-slate-300"
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
            <Button variant="outline" size="sm" icon={<Upload className="h-3.5 w-3.5" />} className="border-white/10 hover:bg-white/5 text-xs text-slate-300" onClick={onImport}>
              Import
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" icon={<LayoutList className="h-3.5 w-3.5" />} className="border-white/10 hover:bg-white/5 text-xs text-slate-300">
                Density
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/5 text-slate-200">
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
                <Button variant="outline" size="sm" icon={<SlidersHorizontal className="h-3.5 w-3.5" />} className="border-white/10 hover:bg-white/5 text-xs text-slate-300">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-white/5 text-slate-200">
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

      <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm border-collapse">
            <thead className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/40 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={cn(
                        "relative text-left align-middle text-[10px] font-bold text-slate-450 uppercase tracking-wider select-none",
                        getDensityClass()
                      )}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-white outline-none transition-colors"
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
                          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-white/10 opacity-0 hover:opacity-100 transition-opacity ${
                            header.column.getIsResizing() ? 'bg-white opacity-100' : ''
                          }`}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody ref={tbodyRef}>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {tableColumns.map((_, j) => (
                      <td key={j} className={getDensityClass()}>
                        <div className="skeleton-shimmer h-4 w-full opacity-30 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-none shadow-none py-16 text-slate-400"
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => handleKeyDown(e, idx, row.original)}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'border-b border-white/5 transition-colors hover:bg-white/[0.02] data-[state=selected]:bg-white/[0.04]',
                      onRowClick && 'cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.03] focus-visible:ring-1 focus-visible:ring-white/20'
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn("align-middle text-slate-300", getDensityClass())}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

      {/* Premium Floating Bulk Actions Dock */}
      {selectedCount > 0 && bulkActions && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-white/10 px-4 py-2.5 rounded-full flex items-center gap-3 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <CheckSquare className="h-4 w-4 text-white" />
            <span>{selectedCount} Selected</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            {bulkActions(table.getFilteredSelectedRowModel().rows.map(r => r.original))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { ColumnDef };
