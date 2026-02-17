"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { EmptyState } from "@/shared/components/empty-state";
import { StatusBadge } from "@/shared/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useDeleteSubmissionMutation } from "../hooks/use-submissions-mutations";
import { useRealtimeSubmissions } from "../hooks/use-realtime-submissions";
import { SubmissionForm } from "./submission-form";

type Submission = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCreators: number;
  totalBatches: number;
};

const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "totalCreators",
    header: "Creators",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.totalCreators}</span>,
  },
  {
    accessorKey: "totalBatches",
    header: "Uploads",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.totalBatches}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right"></div>,
    cell: ({ row, table }) => {
      const onDelete = (table.options.meta as { onDeleteSubmission?: (id: string) => void })
        ?.onDeleteSubmission;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <MoreVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem asChild>
                <Link href={`/submissions/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive! cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  onDelete?.(row.original.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function SubmissionList({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  useRealtimeSubmissions();
  const deleteSubmissionMutation = useDeleteSubmissionMutation();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [submissionToDelete, setSubmissionToDelete] = React.useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  function openDeleteDialog(submissionId: string) {
    setSubmissionToDelete(submissionId);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteSubmission() {
    if (!submissionToDelete) return;
    try {
      await deleteSubmissionMutation.mutateAsync(submissionToDelete);
      toast.success("Submission deleted");
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    } catch (err) {
      console.error("Failed to delete submission:", err);
      toast.error("Failed to delete submission");
    }
  }

  const table = useReactTable({
    data: submissions,
    columns,
    meta: { onDeleteSubmission: openDeleteDialog },
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div
      className={`w-full flex flex-col justify-between gap-4 ${!table.getRowModel().rows?.length ? "flex-1" : ""}`}
    >
      <div className="flex items-end justify-between ">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Submissions</h2>
          <p className="text-sm text-muted-foreground">
            Manage submissions and track creator uploads
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="outline" size="sm">
                  <Plus />
                  <span className="hidden lg:inline">New Folder</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new submission folder</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Submission Folder</DialogTitle>
            </DialogHeader>
            <SubmissionForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      {table.getRowModel().rows?.length ? (
        <div className="overflow-hidden rounded-lg border flex flex-col min-h-0">
          <Table className="flex-1">
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/submissions/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === "actions") {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="Submissions"
          description="Create a submission folder to collect creator content"
          action={{
            label: "New Folder",
            onClick: () => setIsDialogOpen(true),
            icon: <Plus className="size-4" />,
          }}
        />
      )}
      <div className="text-muted-foreground hidden text-sm lg:flex">
        {table.getFilteredRowModel().rows.length} submission(s)
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission folder and all its content. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSubmission}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
