'use client'

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PDFExport } from "@/components/supporting/Table2PDF"
import { motion } from "framer-motion"

export default function LogsTable({
  title,
  description,
  logs = [],
  searchColumn = "id",
  searchPlaceholder = "Filter logs...",
  exportFileName = "Logs.pdf"
}) {
  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'added':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'lost':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'expired':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return ''
    }
  }

  // Get status badge class based on status
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'added':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'lost':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'expired':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'alert':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'border-none'
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Define columns based on the first log entry
  const defineColumns = React.useMemo(() => {
    if (!logs || logs.length === 0) return []

    const firstLog = logs[0]
    return Object.keys(firstLog).map(key => {
      // Skip id field
      if (key === 'id') {
        return {
          accessorKey: key,
          header: 'ID',
          size: 50,
        }
      }

      // Handle status field
      if (key === 'activity') {
        return {
          accessorKey: key,
          header: 'Activity',
          cell: ({ row }) => {
            const status = row.getValue(key)
            console.log(status);
            return (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusClass(status)}`}>
                {getStatusIcon(status)}
                <span>{status}</span>
              </div>
            )
          }
        }
      }

      // Handle status field
      if (key === 'status') {
        return {
          accessorKey: key,
          header: 'Status',
          cell: ({ row }) => {
            const status = row.getValue(key)
            return (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusClass(status)}`}>
                {getStatusIcon(status)}
                <span>{status}</span>
              </div>
            )
          }
        }
      }

      // Handle timestamp fields
      if (key === 'timestamp' || key === 'time' || key === 'created' || key === 'login' || key === 'logout') {
        return {
          accessorKey: key,
          header: key.toUpperCase(),
          cell: ({ row }) => {
            if (row?.original?.login && key === 'timestamp') {
              return null;
            }
            const timestamp = row.getValue(key)
            return formatTimestamp(timestamp)
          }
        }
      }

      // Default column definition
      return {
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        cell: ({ row }) => <div>{row.getValue(key)}</div>
      }
    })
  }, [logs])

  const columns = defineColumns

  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data: logs,
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
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="backdrop-blur-sm bg-card/80 border border-border/50">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchColumn)?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn(searchColumn)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <div className="flex items-center gap-4">
              <PDFExport
                data={logs}
                columns={columns}
                fileName={exportFileName}
                title={title}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
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
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
