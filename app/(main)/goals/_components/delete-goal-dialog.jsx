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
import { deleteFinancialGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

export function DeleteGoalDialog({
  isOpen,
  onClose,
  goal,
  accounts = [],
  onSuccess,
}) {
  const [releaseFunds, setReleaseFunds] = useState(true);
  const [targetAccountId, setTargetAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);

  if (!goal) return null;

  const currentSaved = Number(goal.savedAmount) || 0;
  const hasFunds = currentSaved > 0;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteFinancialGoal({
        goalId: goal.id,
        releaseToAccountId: hasFunds && releaseFunds ? targetAccountId : null,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to delete goal");
      }

      if (hasFunds && releaseFunds) {
        toast.success(
          `Goal "${goal.name}" deleted and ₹${currentSaved.toFixed(
            2
          )} was refunded back to your account.`
        );
      } else {
        toast.success(`Goal "${goal.name}" deleted.`);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#160b28] border-red-500/40 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            Delete Financial Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">&ldquo;{goal.name}&rdquo;</span>?
          </p>

          {hasFunds ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-2 text-amber-300">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">
                    This goal currently has ₹
                    {currentSaved.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    allocated.
                  </p>
                  <p className="text-[11px] text-gray-300 mt-1">
                    What would you like to do with these funds?
                  </p>
                </div>
              </div>

              {/* Decision radio */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-black/30 border border-purple-800/40 cursor-pointer">
                  <input
                    type="radio"
                    name="fundAction"
                    checked={releaseFunds}
                    onChange={() => setReleaseFunds(true)}
                    className="text-purple-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white">
                      (Recommended) Refund ₹{currentSaved.toFixed(2)} to account
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Returns the allocated money back to your bank balance safely.
                    </p>
                  </div>
                </label>

                {releaseFunds && (
                  <div className="pl-6 space-y-1">
                    <label className="text-[11px] text-gray-300">
                      Refund destination account:
                    </label>
                    <select
                      value={targetAccountId}
                      onChange={(e) => setTargetAccountId(e.target.value)}
                      className="w-full p-2 rounded-lg bg-[#0f051d] border border-purple-700/40 text-white text-xs focus:outline-none"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id} className="bg-[#160b28]">
                          {acc.name} — Current: ₹{Number(acc.balance).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-black/30 border border-red-800/30 cursor-pointer">
                  <input
                    type="radio"
                    name="fundAction"
                    checked={!releaseFunds}
                    onChange={() => setReleaseFunds(false)}
                    className="text-red-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-red-300">
                      Discard allocation without refund
                    </span>
                    <p className="text-[11px] text-gray-400">
                      Deletes the goal allocation without restoring account balance.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              No funds are currently allocated to this goal. Deleting it will remove the
              goal and its record.
            </p>
          )}

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
              type="button"
              onClick={handleDelete}
              disabled={loading || (hasFunds && releaseFunds && !targetAccountId)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Goal"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
