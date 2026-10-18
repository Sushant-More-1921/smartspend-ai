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
import { IconPicker } from "./icon-picker";
import { createFinancialGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, AlertCircle } from "lucide-react";

export const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Technology & Gadgets",
  "Travel & Vacation",
  "Education",
  "Real Estate / House",
  "Vehicle / Transport",
  "Investments & Wealth",
  "Retirement",
  "Family & Health",
  "Other Savings",
];

export function CreateGoalDialog({
  isOpen,
  onClose,
  accounts = [],
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialContribution, setInitialContribution] = useState("0");
  const [sourceAccountId, setSourceAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || ""
  );
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Target");
  const [expectedReturnRate, setExpectedReturnRate] = useState("0");
  const [loading, setLoading] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === sourceAccountId);
  const availableBalance = selectedAccount
    ? Number(selectedAccount.balance) || 0
    : 0;

  const numInitial = parseFloat(initialContribution) || 0;
  const numTarget = parseFloat(targetAmount) || 0;
  const isInitialTooHigh = numInitial > availableBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide a name for your financial goal");
      return;
    }

    if (numTarget <= 0) {
      toast.error("Target amount must be greater than ₹0");
      return;
    }

    if (numInitial < 0) {
      toast.error("Initial contribution cannot be negative");
      return;
    }

    if (numInitial > 0 && isInitialTooHigh) {
      toast.error(
        `Initial contribution (₹${numInitial.toFixed(
          2
        )}) exceeds account balance (₹${availableBalance.toFixed(2)})`
      );
      return;
    }

    if (numInitial > 0 && !sourceAccountId) {
      toast.error("Please select an account for the initial contribution");
      return;
    }

    setLoading(true);
    try {
      const res = await createFinancialGoal({
        name: name.trim(),
        targetAmount: numTarget,
        initialContribution: numInitial,
        sourceAccountId: numInitial > 0 ? sourceAccountId : undefined,
        category,
        targetDate: targetDate || null,
        description: description?.trim() || null,
        icon,
        expectedReturnRate: parseFloat(expectedReturnRate) || 0,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to create financial goal");
      }

      toast.success(`Goal "${name}" created successfully!`);
      // Reset form
      setName("");
      setTargetAmount("");
      setInitialContribution("0");
      setTargetDate("");
      setDescription("");
      setIcon("Target");
      setExpectedReturnRate("0");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#160b28] border-purple-500/40 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Create Financial Goal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Goal Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Goal Name <span className="text-pink-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
              required
            />
          </div>

          {/* Category & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0f051d] border border-purple-700/40 text-white text-sm focus:outline-none focus:border-purple-400"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#160b28]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">
                Target Date (Optional)
              </label>
              <Input
                type="date"
                value={targetDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Select Goal Icon
            </label>
            <IconPicker selected={icon} onSelect={setIcon} />
          </div>

          {/* Target Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Target Amount (₹) <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="pl-7 bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 font-semibold"
                required
              />
            </div>
          </div>

          {/* Initial Contribution & Source Account */}
          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-purple-300">
                Initial Contribution (Optional)
              </span>
              <span className="text-[11px] text-gray-400">
                Transfer from bank now
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={initialContribution}
                onChange={(e) => setInitialContribution(e.target.value)}
                className="pl-7 bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
              />
            </div>

            {numInitial > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-gray-300 flex justify-between">
                  <span>Source Account</span>
                  <span className="text-purple-300">
                    Available: ₹{availableBalance.toFixed(2)}
                  </span>
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0f051d] border border-purple-700/40 text-white text-sm focus:outline-none focus:border-purple-400"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-[#160b28]">
                      {acc.name} ({acc.type}) — ₹{Number(acc.balance).toFixed(2)}
                    </option>
                  ))}
                </select>

                {isInitialTooHigh && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Initial contribution exceeds available balance in this account
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Expected Return Rate for Planner (Optional) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-gray-300">
                Assumed Investment Return (% Annual, Optional)
              </label>
              <span className="text-[11px] text-gray-400">
                For planner projections
              </span>
            </div>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="e.g. 10"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
            />
            <p className="text-[11px] text-gray-400">
              Assumes 0% for pure cash savings. Set e.g. 10% to project mutual fund / SIP growth.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300">
              Description / Notes (Optional)
            </label>
            <Input
              type="text"
              placeholder="Why are you saving for this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
              maxLength={200}
            />
          </div>

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
              disabled={loading || numTarget <= 0 || (numInitial > 0 && isInitialTooHigh)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Creating Goal...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Goal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
