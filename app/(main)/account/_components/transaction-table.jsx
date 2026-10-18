"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions ? [...transactions] : [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date": {
          const rawA = new Date(a.date);
          const rawB = new Date(b.date);
          const dayA = new Date(
            rawA.getFullYear(),
            rawA.getMonth(),
            rawA.getDate()
          ).getTime();
          const dayB = new Date(
            rawB.getFullYear(),
            rawB.getMonth(),
            rawB.getDate()
          ).getTime();
          const createdA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : rawA.getTime();
          const createdB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : rawB.getTime();

          comparison = dayA - dayB;
          if (comparison === 0) {
            comparison = createdA - createdB;
          }
          break;
        }
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const { loading: deleteLoading, fn: deleteFn, data: deleted } =
    useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transactions deleted successfully");
      router.refresh();
    }
  }, [deleted, deleteLoading, router]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all">
      {deleteLoading && (
        <BarLoader className="mb-4" width={"100%"} color="#2563eb" />
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search transactions by description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[125px] h-9 text-xs bg-slate-50 border-slate-200 text-slate-700 rounded-xl">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl">
              <SelectItem value="INCOME" className="text-xs">Income</SelectItem>
              <SelectItem value="EXPENSE" className="text-xs">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[145px] h-9 text-xs bg-slate-50 border-slate-200 text-slate-700 rounded-xl">
              <SelectValue placeholder="All Cadences" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl">
              <SelectItem value="recurring" className="text-xs">Recurring Only</SelectItem>
              <SelectItem value="non-recurring" className="text-xs">One-time Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold h-9 gap-1.5"
            >
              <Trash className="h-3.5 w-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </Button>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear all filters"
              className="h-9 w-9 border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-slate-200/90 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="w-[44px]">
                <Checkbox
                  className="border-slate-300"
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer text-slate-700 font-semibold text-xs select-none"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  <span>Date</span>
                  {sortConfig.field === "date" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-slate-700 font-semibold text-xs">
                Description
              </TableHead>
              <TableHead
                className="cursor-pointer text-slate-700 font-semibold text-xs select-none"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  <span>Category</span>
                  {sortConfig.field === "category" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer text-right text-slate-700 font-semibold text-xs select-none"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Amount</span>
                  {sortConfig.field === "amount" ? (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-slate-700 font-semibold text-xs">
                Cadence
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-slate-400"
                >
                  No transactions match the selected criteria
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="hover:bg-slate-50/70 border-b border-slate-100 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      className="border-slate-300"
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                    />
                  </TableCell>
                  <TableCell className="text-slate-600 text-xs font-medium whitespace-nowrap">
                    {transaction.date && !isNaN(new Date(transaction.date).getTime())
                      ? format(new Date(transaction.date), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-slate-900 font-medium text-sm">
                    {transaction.description || "Untitled Transaction"}
                  </TableCell>
                  <TableCell className="capitalize">
                    <span
                      style={{
                        background: categoryColors[transaction.category] || "#64748B",
                      }}
                      className="px-2.5 py-0.5 rounded-full text-white text-[11px] font-semibold inline-block shadow-2xs"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-bold whitespace-nowrap tabular-nums text-sm",
                      transaction.type === "EXPENSE"
                        ? "text-rose-600"
                        : "text-emerald-600"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}₹{transaction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-blue-50 text-blue-700 border-blue-200/60 text-[11px] font-medium"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ] || "Recurring"
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white rounded-lg">
                            <div className="text-xs">
                              <span className="text-slate-400">Next Scheduled:</span>{" "}
                              {transaction.nextRecurringDate && !isNaN(new Date(transaction.nextRecurringDate).getTime())
                                ? format(new Date(transaction.nextRecurringDate), "PP")
                                : "N/A"}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-slate-500 border-slate-200 text-[11px] font-normal">
                        <Clock className="h-3 w-3" />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                          className="text-xs cursor-pointer"
                        >
                          Edit Transaction
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-xs text-rose-600 cursor-pointer focus:text-rose-600 focus:bg-rose-50"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to <strong className="text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)}</strong> of <strong className="text-slate-900">{filteredAndSortedTransactions.length}</strong> transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
