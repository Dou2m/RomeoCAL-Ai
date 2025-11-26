import { Injectable } from '@angular/core';
import { DailyGoals } from '../models/nutrition.model';

const GOALS_STORAGE_KEY = 'dailyNutritionalGoals';
const THEME_STORAGE_KEY = 'appThemeKey';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {

  saveGoals(goals: DailyGoals): void {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving goals to localStorage', e);
    }
  }

  loadGoals(): DailyGoals | null {
    try {
      const goalsJson = localStorage.getItem(GOALS_STORAGE_KEY);
      if (goalsJson) {
        return JSON.parse(goalsJson) as DailyGoals;
      }
      return null;
    } catch (e) {
      console.error('Error loading goals from localStorage', e);
      return null;
    }
  }

  saveTheme(themeKey: string): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeKey);
    } catch (e) {
      console.error('Error saving theme to localStorage', e);
    }
  }

  loadTheme(): string | null {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (e) {
      console.error('Error loading theme from localStorage', e);
      return null;
    }
  }
}