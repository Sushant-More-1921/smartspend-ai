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
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#160b28] border-purple-500/40 text-white rounded-2xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-purple-400" />
          Edit Financial Goal
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
            required
          />
        </div>

        {/* Category & Target Date */}
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
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Icon Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300">
            Goal Icon
          </label>
          <IconPicker selected={icon} onSelect={setIcon} />
        </div>

        {/* Target Amount */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-gray-300">
              Target Amount (₹) <span className="text-pink-400">*</span>
            </label>
            <span className="text-xs text-purple-300">
              Currently Saved: ₹{currentSaved.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400 font-medium">
              ₹
            </span>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="pl-7 bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400 font-semibold"
              required
            />
          </div>
          {isTargetBelowSaved && (
            <p className="text-xs text-amber-300 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              New target is lower than saved amount (₹{currentSaved.toFixed(2)}).
              This will mark the goal as Completed.
            </p>
          )}
        </div>

        {/* Expected Return Rate */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300">
            Assumed Annual Investment Return (%)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(e.target.value)}
            className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-300">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#0f051d] border-purple-700/40 text-white focus:border-purple-400"
            maxLength={200}
          />
        </div>

        <DialogFooter className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold rounded-xl px-5 shadow-lg flex items-center gap-2"
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
