"use client";

import { useState } from "react";
import { Pencil, Check, X, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import Link from "next/link";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const budgetAmount = initialBudget?.amount ? Number(initialBudget.amount) : 0;
  const percentUsed = budgetAmount > 0 ? (currentExpenses / budgetAmount) * 100 : 0;
  const remaining = Math.max(0, budgetAmount - currentExpenses);

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateBudget(amount);
      if (res?.success) {
        setIsEditing(false);
        toast.success("Budget updated successfully");
      } else {
        toast.error(res?.error || "Failed to update budget");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update budget");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  const isWarning = percentUsed >= 75 && percentUsed < 90;
  const isDanger = percentUsed >= 90;

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Monthly Spending Budget
              </CardTitle>
              <p className="text-xs text-slate-500">
                Default Account Spending Limit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-36 h-8 text-sm bg-white border-slate-300 text-slate-900 rounded-lg"
                  placeholder="Enter limit"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="h-8 w-8 text-emerald-600 border-emerald-300 hover:bg-emerald-50 rounded-lg"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="h-8 w-8 text-slate-500 border-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {budgetAmount > 0
                    ? `₹${currentExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ₹${budgetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent`
                    : "No monthly budget configured"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  title="Edit budget"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <Link href="/smart-budget" prefetch={true} className="shrink-0">
          <Button
            variant="outline"
            className="gap-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 font-semibold text-xs rounded-xl px-4 py-2 h-auto shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Smart Recommendations</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-0">
        {budgetAmount > 0 ? (
          <div className="space-y-2">
            <Progress
              value={Math.min(100, percentUsed)}
              className="h-2.5 bg-slate-100 rounded-full"
              extraStyles={
                isDanger
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }
            />
            <div className="flex justify-between items-center text-xs text-slate-500 pt-0.5">
              <span>Remaining: <strong className="text-slate-800">₹{remaining.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              <span className={`font-semibold ${isDanger ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"}`}>
                {percentUsed.toFixed(1)}% used
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Click the edit button above to assign a spending ceiling for this month.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
