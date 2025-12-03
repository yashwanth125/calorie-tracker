"use client";

import { useEffect, useState } from "react";
import { getDailyTotals } from "@/lib/getDailyTotals";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DailyNutrition() {
  const [totals, setTotals] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const loadTotals = async () => {
    const data = await getDailyTotals();
    setTotals(data);
  };

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <button
        onClick={async () => {
          if (!open) await loadTotals();
          setOpen(!open);
        }}
        className="w-full flex justify-between items-center bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold"
      >
        <span>Today's Nutrition Summary</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Drop-down Card */}
      {open && totals && (
        <div className="bg-white mt-3 p-6 rounded-2xl shadow-lg border">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Today's Totals</h3>

          <div className="grid grid-cols-2 gap-4">
            <Card label="Calories" value={totals.calories} large />
            <Card label="Protein" value={totals.protein + 'g'} />
            <Card label="Carbs" value={totals.carbs + 'g'} />
            <Card label="Fat" value={totals.fat + 'g'} />
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, large = false }: any) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-4 rounded-xl text-center shadow-md">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-bold text-gray-800 ${large ? "text-3xl" : "text-xl"}`}>
        {value}
      </p>
    </div>
  );
}
