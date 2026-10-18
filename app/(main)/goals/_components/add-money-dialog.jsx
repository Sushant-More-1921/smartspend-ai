"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addGoalContribution } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2, PlusCircle, AlertCircle, ArrowRight } from "lucide-react";

export function AddMoneyDialog({
  isOpen,
  onClose,
  goal,
  accounts = [],
  onSuccess,
}) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowOverfunding, setAllowOverfunding] = useState(false);

  if (!goal) return null;

  const currentSaved = Number(goal.savedAmount) || 0;
  const targetAmount = Number(goal.targetAmount) || 0;
  const remaining = Math.max(0, targetAmount - currentSaved);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountBalance = selectedAccount ? Number(selectedAccount.balance) || 0 : 0;

  const numAmount = parseFloat(amount) || 0;
  const isOverfunding = numAmount > remaining && remaining > 0;
  const isBalanceExceeded = numAmount > accountBalance;

  const handleFillRemaining = () => {
    if (remaining > 0) {
      const fillAmount = Math.min(remaining, accountBalance);
      setAmount(fillAmount.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numAmount <= 0) {
      toast.error("Please enter a contribution amount greater than ₹0");
      return;
    }

    if (!selectedAccountId) {
      toast.error("Please select an account to contribute from");
      return;
    }

    if (isBalanceExceeded) {
      toast.error(
        `Insufficient balance in ${selectedAccount?.name}. Available: ₹${accountBalance.toFixed(
          2
        )}`
      );
      return;
    }

    if (isOverfunding && !allowOverfunding) {
      toast.warning(
        `This contribution of ₹${numAmount.toFixed(
          2
        )} exceeds the remaining target ₹${remaining.toFixed(
          2
        )}. Check "Allow overfunding" if you wish to proceed.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await addGoalContribution({
        goalId: goal.id,
        sourceAccountId: selectedAccountId,
        amount: numAmount,
        note: note.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to add contribution");
      }

      toast.success(
        `Successfully allocated ₹${numAmount.toLocaleString(
          "en-IN"
        )} to "${goal.name}"!`
      );
      setAmount("");
      setNote("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add money");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            Add Money to Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Goal Summary Header */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Target Goal</span>
              <span className="text-xs font-semibold text-slate-900">
                {goal.name}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <p className="text-[11px] text-slate-500">Current Saved</p>
                <p className="text-base font-bold text-slate-900">
                  ₹{currentSaved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div className="text-right">
                <p className="text-[11px] text-slate-500">Target Amount</p>
                <p className="text-base font-bold text-blue-600">
                  ₹{targetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200/60">
              <span className="text-slate-500">Still needed:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-600">
                  ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {remaining > 0 && accountBalance > 0 && (
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    className="text-[10px] text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Auto-Fill
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Source Account Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 flex justify-between">
              <span>Source Account</span>
              <span className="text-slate-500 font-normal">
                Available: ₹{accountBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type}) — ₹{Number(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Contribution Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Contribution Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
                required
              />
            </div>
            {isBalanceExceeded && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Amount exceeds available balance in {selectedAccount?.name}
              </p>
            )}
          </div>

          {/* Overfunding warning checkbox */}
          {isOverfunding && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5">
              <p className="text-amber-800 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                This amount exceeds the remaining goal target by ₹
                {(numAmount - remaining).toFixed(2)}.
              </p>
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowOverfunding}
                  onChange={(e) => setAllowOverfunding(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-0"
                />
                <span>I understand and want to allocate extra funds</span>
              </label>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. October savings, Diwali bonus"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
              maxLength={100}
            />
          </div>

          {/* Notice of Accounting Preservation */}
          <p className="text-[11px] text-slate-400 italic">
            * Transferred safely from your account to this goal. This allocation is not
            recorded as an expense.
          </p>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                numAmount <= 0 ||
                isBalanceExceeded ||
                (isOverfunding && !allowOverfunding)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Allocating...
                </>
              ) : (
                `Confirm Contribution (₹${numAmount ? numAmount.toFixed(2) : "0.00"})`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
