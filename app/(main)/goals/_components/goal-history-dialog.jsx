"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGoalContributionHistory } from "@/actions/goals";
import { format } from "date-fns";
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Calendar,
  Wallet,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function GoalHistoryContent({ goal }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    getGoalContributionHistory(goal.id)
      .then((res) => {
        if (!isCancelled) {
          if (res.success) {
            setHistory(res.data || []);
          } else {
            setError(res.error || "Failed to load history");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err?.message || "Failed to load history");
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [goal.id]);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-400 space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <p className="text-xs">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-xs">
        No contribution records found for this goal yet.
      </div>
    );
  }

  return (
    <>
      {history.map((item) => {
        const isRefund =
          item.transactionType === "REFUND" ||
          item.transactionType === "WITHDRAWAL";
        const amountNum = Number(item.amount) || 0;
        const dateStr = item.createdAt
          ? format(new Date(item.createdAt), "dd MMM yyyy, hh:mm a")
          : "N/A";

        return (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-[#0e051c] border border-purple-800/30 hover:border-purple-600/40 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isRefund
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {isRefund ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      isRefund
                        ? "border-amber-500/50 text-amber-300 bg-amber-950/30 text-[10px]"
                        : "border-emerald-500/50 text-emerald-300 bg-emerald-950/30 text-[10px]"
                    }
                  >
                    {isRefund ? "Funds Released" : "Contribution"}
                  </Badge>
                </div>
              </div>
              <div
                className={`text-base font-bold ${
                  isRefund ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {isRefund ? "-" : "+"}₹{amountNum.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 pt-1 border-t border-purple-950">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{dateStr}</span>
              </div>
              {item.sourceAccount && (
                <div className="flex items-center gap-1.5 justify-end">
                  <Wallet className="w-3.5 h-3.5 text-pink-400" />
                  <span className="truncate">
                    {item.sourceAccount.name}
                  </span>
                </div>
              )}
            </div>

            {item.note && (
              <div className="flex items-start gap-1.5 text-xs text-gray-300 bg-purple-950/20 p-2 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="italic">&ldquo;{item.note}&rdquo;</span>
              </div>
            )}

            {item.reference && (
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Ref:</span>
                <span>{item.reference}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export function GoalHistoryDialog({ isOpen, onClose, goal }) {
  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col bg-[#160b28] border-purple-500/40 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            Contribution History: {goal.name}
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Audit log of all funds allocated or released for this goal.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pt-2">
          {isOpen && <GoalHistoryContent key={goal.id} goal={goal} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
