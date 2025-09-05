"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";
import Link from "next/link";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card className="group relative rounded-2xl bg-gradient-to-b from-[#0a0a0a] to-[#111] border border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
      {/* Glassy overlay for subtle shine */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Monthly Budget (Default Account)
          </CardTitle>

          <div className="flex items-center gap-2 mt-1 text-white">
            {isEditing ? (  
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32 bg-transparent border-gray-600 text-white"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                  className="hover:hover:bg-purple-400"
                >
                  <Check className="h-4 w-4 text-green-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="hover:hover:bg-purple-400"
                >
                  <X className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription className="text-gray-300">
                  {initialBudget
                    ? `$${currentExpenses.toFixed(
                        2
                      )} of $${initialBudget.amount.toFixed(2)} spent`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 hover:bg-purple-400"
                >
                  <Pencil className="h-3 w-3 text-gray-300" />
                </Button>
              </>
            )}
          </div>
        </div>

        <Link href="/smart-budget">
          <Button
            className="ml-3 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-md transition-all bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 hover:opacity-90 hover:scale-[1.02]"
            type="button"
          >
            Smart Budget Recommendation
            <img src="/ai-technology.png" alt="AI" className="h-5 w-5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="relative z-10">
        {initialBudget && (
          <div className="space-y-2">
            <Progress
              value={percentUsed}
              className="h-2 bg-gray-700 rounded-full"
              extraStyles={`${
                percentUsed >= 90
                  ? "bg-red-500"
                  : percentUsed >= 75
                  ? "bg-yellow-500"
                  : "bg-purple-400"
              }`}
            />
            <p className="text-xs text-gray-400 text-right">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
