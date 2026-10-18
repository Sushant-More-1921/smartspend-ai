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
      <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            Delete Financial Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">&ldquo;{goal.name}&rdquo;</span>?
          </p>

          {hasFunds ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    This goal currently has ₹
                    {currentSaved.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    allocated.
                  </p>
                  <p className="text-[11px] text-amber-800/90 mt-1">
                    What would you like to do with these funds?
                  </p>
                </div>
              </div>

              {/* Decision radio */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer shadow-2xs">
                  <input
                    type="radio"
                    name="fundAction"
                    checked={releaseFunds}
                    onChange={() => setReleaseFunds(true)}
                    className="mt-0.5 text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      (Recommended) Refund ₹{currentSaved.toFixed(2)} to account
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Returns the allocated money back to your bank balance safely.
                    </p>
                  </div>
                </label>

                {releaseFunds && (
                  <div className="pl-6 space-y-1">
                    <label className="text-[11px] text-slate-600 font-medium">
                      Refund destination account:
                    </label>
                    <select
                      value={targetAccountId}
                      onChange={(e) => setTargetAccountId(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — Current: ₹{Number(acc.balance).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer shadow-2xs">
                  <input
                    type="radio"
                    name="fundAction"
                    checked={!releaseFunds}
                    onChange={() => setReleaseFunds(false)}
                    className="mt-0.5 text-rose-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-rose-700 block">
                      Discard allocation without refund
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Deletes the goal allocation without restoring account balance.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
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
              className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={loading || (hasFunds && releaseFunds && !targetAccountId)}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs font-semibold"
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
