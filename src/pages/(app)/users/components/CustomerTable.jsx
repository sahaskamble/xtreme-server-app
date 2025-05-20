import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { format } from "date-fns";
import { PDFExport } from "@/components/supporting/Table2PDF"
import { usePocketBase } from "@/hooks/usePocketBase"
import { toast } from "sonner";

export default function CustomerTable({ data }) {
  const { deleteRecord } = usePocketBase();
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({})

  const columns = [
    {
      accessorKey: "created",
      header: "Joined On",
      cell: ({ row }) => format(new Date(row.getValue("created")), 'MMM dd, yyyy'),
    },
    {
      accessorKey: "expand.user.username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Username
            <ArrowUpDown />
          </Button>
        )
      },
      cell: ({ row }) => <div className='ml-2'>{row.original.expand?.user.username}</div>,
    },
    {
      accessorKey: "expand.user.name",
      header: 'Name',
      cell: ({ row }) => <div>{row.original.expand?.user.name}</div>,
    },
    {
      accessorKey: "contact",
      header: 'Contact',
      cell: ({ row }) => <div>+91 {row.getValue("contact")}</div>,
    },
    {
      accessorKey: "expand.user.email",
      header: 'Email',
      cell: ({ row }) => <div>{row.original.expand?.user.email}</div>,
    },
    {
      accessorKey: "wallet",
      header: 'Wallet',
      cell: ({ row }) => <div>{row.original.wallet.toLocaleString()}</div>,
    },
    {
      accessorKey: "type",
      header: 'Type',
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
    },
    {
      accessorKey: "membership",
      header: 'Membership',
      cell: ({ row }) => <div>{row.getValue("membership")}</div>,
    },
    {
      id: "actions",
      accessorKey: "",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  console.log("Edit customer:", row.original.user);
                  // TODO: Implement edit dialog using appropriate method for this project
                  toast.info(`Edit dialog would open for customer with ID: ${row.original.user}`);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={'text-red-500'}
                onClick={async () => {
                  const result = confirm('Are you sure you want to delete this customer?');
                  if (result) {
                    try {
                      await deleteRecord('customers', row.original.id);
                      toast.success('Customer deleted successfully');
                    } catch (error) {
                      toast.error('Failed to delete customer: ' + (error.message || 'Unknown error'));
                    }
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

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
    },
  })

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4">
        <Input
          placeholder="Filter by Username..."
          value={(table.getColumn("username")?.getFilterValue()) ?? ""}
          onChange={(event) =>
            table.getColumn("username")?.setFilterValue(event.target.value)
          }
          className="max-w-sm w-full"
        />
        <div className="flex items-center gap-4">
          <PDFExport
            data={data}
            columns={columns}
            fileName="Devices.pdf"
            title="Devices List"
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown />
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
      <div className="rounded-md border">
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
    </div>
  )
}
