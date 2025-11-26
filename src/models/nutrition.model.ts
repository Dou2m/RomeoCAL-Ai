
export interface FoodItem {
  id: string;
  mealName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar: number;
}

export interface AnalysisResult {
  mealName: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  sugar: number;
}

export interface DailyGoals {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
}
