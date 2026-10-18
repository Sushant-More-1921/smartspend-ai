"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (!editMode && formData.type === "EXPENSE") {
      const selectedAccount = accounts.find((a) => a.id === formData.accountId);
      const currentBal = selectedAccount ? parseFloat(selectedAccount.balance) : 0;
      if (formData.amount > currentBal) {
        toast.error(
          `Insufficient funds! Current account balance is ₹${currentBal.toFixed(2)}, so this expense of ₹${formData.amount.toFixed(2)} would make your account negative.`
        );
        return;
      }
    }

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("type", "EXPENSE");
      setValue("amount", scannedData.amount.toString());
      if (scannedData.date) {
        const d = new Date(scannedData.date);
        setValue("date", !isNaN(d.getTime()) ? d : new Date());
      }
      if (scannedData.description) {
        setValue("description", scannedData.description);
      }
      if (scannedData.category) {
        setValue("category", scannedData.category);
      }
    }
  };

  useEffect(() => {
    if (editMode && initialData) {
      reset({
        type: initialData.type,
        amount: initialData.amount.toString(),
        description: initialData.description || "",
        accountId: initialData.accountId,
        category: initialData.category,
        date: new Date(initialData.date),
        isRecurring: initialData.isRecurring || false,
        ...(initialData.recurringInterval && {
          recurringInterval: initialData.recurringInterval,
        }),
      });
    }
  }, [editMode, initialData, reset]);

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully",
        { id: "transaction-action-toast" }
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
      router.refresh();
      setTimeout(() => {
        router.refresh();
      }, 150);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const type = watch("type");
  const accountId = watch("accountId");
  const amount = watch("amount");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const numAmount = parseFloat(amount) || 0;
  const isExpense = type === "EXPENSE";
  const availableBal = selectedAccount ? parseFloat(selectedAccount.balance) : 0;
  const isInsufficientFunds =
    !editMode && isExpense && numAmount > availableBal && numAmount > 0;

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Receipt Scanner - Only in Create Mode */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Transaction Type Segmented Control */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setValue("type", "EXPENSE")}
            className={cn(
              "py-2 text-xs font-bold rounded-lg transition-all",
              type === "EXPENSE"
                ? "bg-white text-rose-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Expense (Outgoing)
          </button>
          <button
            type="button"
            onClick={() => setValue("type", "INCOME")}
            className={cn(
              "py-2 text-xs font-bold rounded-lg transition-all",
              type === "INCOME"
                ? "bg-white text-emerald-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Income (Incoming)
          </button>
        </div>
        {errors.type && (
          <p className="text-xs text-rose-500">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Amount (₹)</label>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            {...register("amount")}
            onChange={(e) => {
              const value = e.target.value;
              setValue("amount", value);
            }}
            className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
          />
          {errors.amount && (
            <p className="text-xs text-rose-500">{errors.amount.message}</p>
          )}
          {isInsufficientFunds && (
            <p className="text-xs text-amber-600 mt-1 font-medium">
              ⚠️ Expense exceeds available balance (₹{availableBal.toFixed(2)}). Account cannot go negative.
            </p>
          )}
        </div>

        {/* Target Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="h-10 text-sm bg-white border-slate-300 text-slate-900 rounded-xl">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="text-sm">
                  {account.name} (₹{parseFloat(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </SelectItem>
              ))}
              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg mt-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create New Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>
          {errors.accountId && (
            <p className="text-xs text-rose-500">{errors.accountId.message}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className="h-10 text-sm bg-white border-slate-300 text-slate-900 rounded-xl">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg">
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id} className="text-sm">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-rose-500">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full h-10 pl-3 text-left font-normal bg-white border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl",
                !date && "text-slate-400"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setValue("date", newDate, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
              disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
              initialFocus
              classNames={{
                day_selected:
                  "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 font-semibold",
                day_today: "border border-blue-600 text-blue-600 font-bold",
              }}
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-xs text-rose-500">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700">Description</label>
        <Input
          placeholder="e.g. Groceries at Trader Joe's, Client retainer fee"
          {...register("description")}
          className="h-10 text-sm bg-white border-slate-300 text-slate-900 focus:border-blue-500 rounded-xl"
        />
        {errors.description && (
          <p className="text-xs text-rose-500">{errors.description.message}</p>
        )}
      </div>

      {/* Recurring Schedule Card */}
      <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="space-y-0.5">
          <label className="text-sm font-semibold text-slate-900">Recurring Transaction</label>
          <p className="text-xs text-slate-500">
            Automatically log this entry on a regular interval
          </p>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Cadence</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="h-10 text-sm bg-white border-slate-300 text-slate-900 rounded-xl">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800 rounded-xl shadow-lg">
              <SelectItem value="DAILY" className="text-sm">Daily</SelectItem>
              <SelectItem value="WEEKLY" className="text-sm">Weekly</SelectItem>
              <SelectItem value="MONTHLY" className="text-sm">Monthly</SelectItem>
              <SelectItem value="YEARLY" className="text-sm">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-xs text-rose-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold text-xs h-10"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs h-10 shadow-xs transition-colors"
          disabled={transactionLoading}
        >
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{editMode ? "Saving Changes..." : "Creating Entry..."}</span>
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Record Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
