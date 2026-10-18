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
import { withdrawGoalFunds } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2, ArrowDownCircle, AlertTriangle } from "lucide-react";

export function WithdrawFundsDialog({
  isOpen,
  onClose,
  goal,
  accounts = [],
  onSuccess,
}) {
  const [targetAccountId, setTargetAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!goal) return null;

  const currentSaved = Number(goal.savedAmount) || 0;
  const numAmount = parseFloat(amount) || 0;
  const isAmountTooHigh = numAmount > currentSaved;

  const handleWithdrawAll = () => {
    setAmount(currentSaved.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numAmount <= 0) {
      toast.error("Please enter an amount greater than ₹0");
      return;
    }

    if (isAmountTooHigh) {
      toast.error(
        `Cannot withdraw ₹${numAmount.toFixed(
          2
        )}. Goal only has ₹${currentSaved.toFixed(2)} allocated.`
      );
      return;
    }

    if (!targetAccountId) {
      toast.error("Please select an account to receive the funds");
      return;
    }

    setLoading(true);
    try {
      const res = await withdrawGoalFunds({
        goalId: goal.id,
        targetAccountId,
        amount: numAmount,
        note: note.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to release funds");
      }

      toast.success(
        `Successfully returned ₹${numAmount.toLocaleString(
          "en-IN"
        )} from "${goal.name}" to your account!`
      );
      setAmount("");
      setNote("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to release funds");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#160b28] border-purple-500/40 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
            <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            Release Funds from Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Allocation Info */}
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Goal</span>
              <span className="font-semibold text-purple-300">{goal.name}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs text-gray-300">Currently Allocated:</span>
              <span className="text-lg font-bold text-emerald-400">
                ₹{currentSaved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {currentSaved > 0 && (
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={handleWithdrawAll}
                  className="text-xs text-purple-400 hover:text-purple-300 underline font-medium"
                >
                  Release Full Amount (₹{currentSaved.toFixed(2)})
                </button>
              </div>
            )}
          </div>

          {/* Destination Account */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Destination Account
            </label>
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0f051d] border border-purple-700/40 text-white text-sm focus:outline-none focus:border-purple-400"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-[#160b28]">
                  {acc.name} ({acc.type}) — Current balance: ₹
                  {Number(acc.balance).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount to Release */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Amount to Release (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={currentSaved}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 font-semibold"
                required
              />
            </div>
            {isAmountTooHigh && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Amount exceeds saved balance in this goal
              </p>
            )}
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Note (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Needed emergency cash, reallocating"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 text-sm"
              maxLength={100}
            />
          </div>

          <p className="text-[11px] text-gray-400 italic">
            * This returns the money directly to your chosen bank account and creates
            a persistent refund record in the goal history.
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
              disabled={loading || numAmount <= 0 || isAmountTooHigh}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Releasing...
                </>
              ) : (
                `Confirm Release (₹${numAmount ? numAmount.toFixed(2) : "0.00"})`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
