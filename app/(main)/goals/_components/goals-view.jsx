"use client";

import React, { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoalsOverviewCards } from "./goals-overview-cards";
import { GoalCard } from "./goal-card";
import { CreateGoalDialog } from "./create-goal-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { AddMoneyDialog } from "./add-money-dialog";
import { WithdrawFundsDialog } from "./withdraw-funds-dialog";
import { DeleteGoalDialog } from "./delete-goal-dialog";
import { GoalHistoryDialog } from "./goal-history-dialog";
import { FinancialPlannerSection } from "./financial-planner-section";
import { useRouter } from "next/navigation";

export function GoalsView({ initialData, initialBehaviourData }) {
  const router = useRouter();

  const goals = initialData?.goals || [];
  const overview = initialData?.overview || {};
  const accounts = initialData?.accounts || [];
  const behaviourData = initialBehaviourData;

  // Filter & Search
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoalForAddMoney, setSelectedGoalForAddMoney] = useState(null);
  const [selectedGoalForEdit, setSelectedGoalForEdit] = useState(null);
  const [selectedGoalForWithdraw, setSelectedGoalForWithdraw] = useState(null);
  const [selectedGoalForDelete, setSelectedGoalForDelete] = useState(null);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState(null);

  // Selected goal in planner
  const [plannerGoalId, setPlannerGoalId] = useState(goals[0]?.id || null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleOpenPlannerForGoal = (goal) => {
    setPlannerGoalId(goal.id);
    const plannerElem = document.getElementById("financial-planner-anchor");
    if (plannerElem) {
      plannerElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filtered goals
  const filteredGoals = goals.filter((g) => {
    if (filterCategory !== "ALL" && g.category !== filterCategory) return false;
    if (filterStatus !== "ALL" && g.status !== filterStatus) return false;
    return true;
  });

  const categories = Array.from(new Set(goals.map((g) => g.category)));

  return (
    <div className="space-y-8">
      {/* 1. Overview Summary Cards */}
      <GoalsOverviewCards overview={overview} />

      {/* 2. Goals Section Header & Category Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Active & Completed Goals ({filteredGoals.length})
            </h3>
          </div>

          {/* Action & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-4 py-2 text-xs shadow-xs transition-colors flex items-center gap-1.5 h-9"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200/90 text-center space-y-4 shadow-xs">
            <div className="p-4 rounded-full bg-blue-50 text-blue-600 w-16 h-16 mx-auto flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">No Financial Goals Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {goals.length === 0
                  ? "Start by creating your first financial goal. Track emergency reserves, dream travel, equipment, or long-term wealth."
                  : "No goals match the selected filters. Try changing or resetting your category or status filters."}
              </p>
            </div>
            {goals.length === 0 && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-xs"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Your First Goal
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                accounts={accounts}
                onAddMoney={setSelectedGoalForAddMoney}
                onEdit={setSelectedGoalForEdit}
                onViewHistory={setSelectedGoalForHistory}
                onWithdraw={setSelectedGoalForWithdraw}
                onDelete={setSelectedGoalForDelete}
                onOpenPlanner={handleOpenPlannerForGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Dedicated Financial Planner Section */}
      <div id="financial-planner-anchor" className="pt-4">
        <FinancialPlannerSection
          goals={goals}
          behaviourData={behaviourData}
          selectedGoalId={plannerGoalId}
          onGoalPlanUpdated={handleRefresh}
        />
      </div>

      {/* Dialog Modals */}
      <CreateGoalDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        accounts={accounts}
        onSuccess={handleRefresh}
      />

      <AddMoneyDialog
        isOpen={!!selectedGoalForAddMoney}
        onClose={() => setSelectedGoalForAddMoney(null)}
        goal={selectedGoalForAddMoney}
        accounts={accounts}
        onSuccess={handleRefresh}
      />

      <EditGoalDialog
        isOpen={!!selectedGoalForEdit}
        onClose={() => setSelectedGoalForEdit(null)}
        goal={selectedGoalForEdit}
        onSuccess={handleRefresh}
      />

      <WithdrawFundsDialog
        isOpen={!!selectedGoalForWithdraw}
        onClose={() => setSelectedGoalForWithdraw(null)}
        goal={selectedGoalForWithdraw}
        accounts={accounts}
        onSuccess={handleRefresh}
      />

      <DeleteGoalDialog
        isOpen={!!selectedGoalForDelete}
        onClose={() => setSelectedGoalForDelete(null)}
        goal={selectedGoalForDelete}
        accounts={accounts}
        onSuccess={handleRefresh}
      />

      <GoalHistoryDialog
        isOpen={!!selectedGoalForHistory}
        onClose={() => setSelectedGoalForHistory(null)}
        goal={selectedGoalForHistory}
      />
    </div>
  );
}
