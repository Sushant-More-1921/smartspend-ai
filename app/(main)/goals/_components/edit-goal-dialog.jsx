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
import { GOAL_CATEGORIES } from "./create-goal-dialog";
import { updateFinancialGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Loader2, Edit3, AlertCircle } from "lucide-react";

function EditGoalForm({ goal, onClose, onSuccess }) {
  const [name, setName] = useState(goal.name || "");
  const [targetAmount, setTargetAmount] = useState(
    goal.targetAmount?.toString() || ""
  );
  const [category, setCategory] = useState(goal.category || GOAL_CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState(
    goal.targetDate
      ? new Date(goal.targetDate).toISOString().split("T")[0]
      : ""
  );
  const [description, setDescription] = useState(goal.description || "");
  const [icon, setIcon] = useState(goal.icon || "Target");
  const [expectedReturnRate, setExpectedReturnRate] = useState(
    goal.expectedReturnRate !== undefined
      ? goal.expectedReturnRate.toString()
      : "0"
  );
  const [loading, setLoading] = useState(false);

  const currentSaved = Number(goal.savedAmount) || 0;
  const numTarget = parseFloat(targetAmount) || 0;
  const isTargetBelowSaved = numTarget > 0 && numTarget < currentSaved;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name?.trim()) {
      toast.error("Please enter a goal name");
      return;
    }

    if (numTarget <= 0) {
      toast.error("Target amount must be greater than zero");
      return;
    }

    setLoading(true);
    try {
      const res = await updateFinancialGoal(goal.id, {
        name: name.trim(),
        targetAmount: numTarget,
        category,
        targetDate: targetDate || null,
        description: description?.trim() || null,
        icon,
        expectedReturnRate: parseFloat(expectedReturnRate) || 0,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to update goal");
      }

      toast.success(`Goal "${name}" updated successfully!`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Edit3 className="w-4 h-4" />
          </div>
          Edit Financial Goal
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Goal Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Goal Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
            required
          />
        </div>

        {/* Category & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Target Date (Optional)
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Icon Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Goal Icon
          </label>
          <IconPicker selected={icon} onSelect={setIcon} />
        </div>

        {/* Target Amount */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-700">
              Target Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-500">
              Currently Saved: ₹{currentSaved.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-medium text-sm">
              ₹
            </span>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="pl-7 bg-white border-slate-200 text-slate-900 focus:border-blue-500 font-semibold rounded-lg text-sm"
              required
            />
          </div>
          {isTargetBelowSaved && (
            <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              New target is lower than saved amount (₹{currentSaved.toFixed(2)}).
              This will mark the goal as Completed.
            </p>
          )}
        </div>

        {/* Expected Return Rate */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Assumed Annual Investment Return (%)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 rounded-lg text-sm"
            maxLength={200}
          />
        </div>

        <DialogFooter className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 shadow-xs flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export function EditGoalDialog({ isOpen, onClose, goal, onSuccess }) {
  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {isOpen && (
        <EditGoalForm
          key={goal.id}
          goal={goal}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Dialog>
  );
}
