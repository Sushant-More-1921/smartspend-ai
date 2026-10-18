"use client";

import { GOAL_ICONS, getGoalIconComponent } from "@/lib/goal-icons";

export { GOAL_ICONS, getGoalIconComponent };

export function IconPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
      {GOAL_ICONS.map((item) => {
        const IconComponent = item.icon;
        const isSelected = selected === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(item.name)}
            title={item.label}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? "bg-blue-600 text-white shadow-xs scale-105"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
