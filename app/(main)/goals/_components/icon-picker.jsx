"use client";

import { GOAL_ICONS, getGoalIconComponent } from "@/lib/goal-icons";

export { GOAL_ICONS, getGoalIconComponent };

export function IconPicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 bg-[#0d041a] rounded-xl border border-purple-800/40">
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
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)] scale-110"
                : "text-gray-400 hover:text-white hover:bg-purple-900/30"
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
