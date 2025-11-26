import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem, DailyGoals } from '../../models/nutrition.model';
import { RadarChartComponent, ChartData, RadarChartColors } from '../radar-chart/radar-chart.component';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  imports: [CommonModule, RadarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardViewComponent {
  private themeService = inject(ThemeService);
  theme = this.themeService.activeTheme;
  
  dailyLog = input.required<FoodItem[]>();
  goals = input.required<DailyGoals>();

  totals = computed(() => {
    return this.dailyLog().reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbohydrates += item.carbohydrates;
        acc.fat += item.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
    );
  });

  caloriesProgress = computed(() => this.calculateProgress(this.totals().calories, this.goals().calories));

  macroData = computed<ChartData[]>(() => [
    { axis: 'Protein', value: this.totals().protein },
    { axis: 'Carbs', value: this.totals().carbohydrates },
    { axis: 'Fat', value: this.totals().fat },
  ]);

  macroGoals = computed<ChartData[]>(() => [
    { axis: 'Protein', value: this.goals().protein },
    { axis: 'Carbs', value: this.goals().carbohydrates },
    { axis: 'Fat', value: this.goals().fat },
  ]);

  macroColors = computed<RadarChartColors>(() => {
    const t = this.theme();
    return { protein: t.protein, carbohydrates: t.carbohydrates, fat: t.fat };
  });

  calculateProgress(current: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  }
}
