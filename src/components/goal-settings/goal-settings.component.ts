import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyGoals } from '../../models/nutrition.model';
import { ThemeService } from '../../services/theme.service';
import { ColorTheme } from '../../models/theme.model';

@Component({
  selector: 'app-goal-settings',
  templateUrl: './goal-settings.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalSettingsComponent {
  private themeService = inject(ThemeService);
  
  currentGoals = input.required<DailyGoals>();
  
  goalsSaved = output<DailyGoals>();
  close = output<void>();

  calories = signal(0);
  protein = signal(0);
  carbohydrates = signal(0);
  fat = signal(0);

  themes = this.themeService.getThemes();
  activeTheme = this.themeService.activeTheme;

  constructor() {
    effect(() => {
      const goals = this.currentGoals();
      this.calories.set(goals.calories);
      this.protein.set(goals.protein);
      this.carbohydrates.set(goals.carbohydrates);
      this.fat.set(goals.fat);
    }, { allowSignalWrites: true });
  }

  onCaloriesInput(event: Event) {
    this.calories.set(Number((event.target as HTMLInputElement).value));
  }
  onProteinInput(event: Event) {
    this.protein.set(Number((event.target as HTMLInputElement).value));
  }
  onCarbsInput(event: Event) {
    this.carbohydrates.set(Number((event.target as HTMLInputElement).value));
  }
  onFatInput(event: Event) {
    this.fat.set(Number((event.target as HTMLInputElement).value));
  }

  onThemeSelected(theme: ColorTheme) {
    this.themeService.setTheme(theme.key);
  }

  onSave() {
    this.goalsSaved.emit({
      calories: this.calories(),
      protein: this.protein(),
      carbohydrates: this.carbohydrates(),
      fat: this.fat(),
    });
  }

  onClose() {
    this.close.emit();
  }
}
