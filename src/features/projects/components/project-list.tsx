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
import { Download, MoreVertical, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/shared/components/blocks/empty-state";
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
import { getAssets } from "../actions/get-assets";
import { downloadAssets } from "../lib/download-assets";
import { ProjectForm } from "./project-form";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  totalCreators: number;
  totalSubmissions: number;
};

const columns: ColumnDef<Project>[] = [
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
    accessorKey: "totalSubmissions",
    header: "Uploads",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.totalSubmissions}</span>
    ),
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
      const meta = table.options.meta as { onDownloadProject?: (id: string, name: string) => void };
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
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/projects/${row.original.id}`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onSelect={(e) => {
                  e.preventDefault();
                  meta.onDownloadProject?.(row.original.id, row.original.name);
                }}
              >
                <Download className="size-4" />
                Download all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function ProjectList({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  async function handleDownloadProject(projectId: string, projectName: string) {
    const { data } = await getAssets({ projectId });
    if (!data?.length) {
      toast.info("No assets to download");
      return;
    }
    await downloadAssets(data, {
      onError: (filename) => toast.error(`Failed to download ${filename}`),
      zipName: projectName,
    });
  }

  const table = useReactTable({
    data: projects,
    columns,
    meta: { onDownloadProject: handleDownloadProject },
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
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">Manage projects and track creator uploads</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button className="cursor-pointer" variant="outline" size="sm">
                  <Plus />
                  <span className="hidden lg:inline">New Project</span>
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new project folder</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSuccess={() => setIsDialogOpen(false)} />
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
                  onClick={() => router.push(`/projects/${row.original.id}`)}
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
          title="Projects"
          description="Create a project folder to collect creator content"
          action={{
            label: "New Project",
            onClick: () => setIsDialogOpen(true),
            icon: <Plus className="size-4" />,
          }}
        />
      )}
      <div className="text-muted-foreground hidden text-sm lg:flex">
        {table.getFilteredRowModel().rows.length} project(s)
      </div>
    </div>
  );
}
