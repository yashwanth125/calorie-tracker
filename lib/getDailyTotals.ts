import { supabase } from "./supabase";

export async function getDailyTotals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("nutrition_logs")
    .select("totals, created_at")
    .eq("user_id", user.id)
    .gte("created_at", today.toISOString());

  if (error) {
    console.error("Error fetching logs:", error);
    return null;
  }

  const summary = data.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.totals.calories || 0),
      protein: acc.protein + (item.totals.protein_g || 0),
      carbs: acc.carbs + (item.totals.carbs_g || 0),
      fat: acc.fat + (item.totals.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // 🎯 Round to 2 decimals
  return {
    calories: Number(summary.calories.toFixed(2)),
    protein: Number(summary.protein.toFixed(2)),
    carbs: Number(summary.carbs.toFixed(2)),
    fat: Number(summary.fat.toFixed(2)),
  };
}
