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
      <DialogContent className="max-w-md bg-[#160b28] border-purple-500/40 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-purple-400" />
            Add Money to Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Goal Summary Header */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Target Goal</span>
              <span className="text-xs font-semibold text-purple-300">
                {goal.name}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <div>
                <p className="text-[11px] text-gray-400">Current Saved</p>
                <p className="text-base font-bold text-white">
                  ₹{currentSaved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <div className="text-right">
                <p className="text-[11px] text-gray-400">Target Amount</p>
                <p className="text-base font-bold text-pink-400">
                  ₹{targetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center text-xs border-t border-purple-800/30">
              <span className="text-gray-400">Still needed:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-amber-300">
                  ₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {remaining > 0 && accountBalance > 0 && (
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline font-medium"
                  >
                    Auto-Fill
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Source Account Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex justify-between">
              <span>Source Account</span>
              <span className="text-purple-300">
                Available: ₹{accountBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0f051d] border border-purple-700/40 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-[#160b28]">
                  {acc.name} ({acc.type}) — ₹{Number(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Contribution Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Contribution Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
                required
              />
            </div>
            {isBalanceExceeded && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Amount exceeds available balance in {selectedAccount?.name}
              </p>
            )}
          </div>

          {/* Overfunding warning checkbox */}
          {isOverfunding && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
              <p className="text-amber-300 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                This amount exceeds the remaining goal target by ₹
                {(numAmount - remaining).toFixed(2)}.
              </p>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowOverfunding}
                  onChange={(e) => setAllowOverfunding(e.target.checked)}
                  className="rounded border-purple-500/40 text-purple-600 focus:ring-0"
                />
                <span>I understand and want to allocate extra funds</span>
              </label>
            </div>
          )}

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. October savings, Diwali bonus"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 text-sm"
              maxLength={100}
            />
          </div>

          {/* Notice of Accounting Preservation */}
          <p className="text-[11px] text-gray-400 italic">
            * Transferred safely from your account to this goal. This allocation is not
            recorded as an expense.
          </p>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-purple-500/40 text-gray-300 hover:text-white hover:bg-purple-900/30 rounded-xl"
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]"
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
