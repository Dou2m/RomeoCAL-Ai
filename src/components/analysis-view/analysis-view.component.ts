import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult, FoodItem } from '../../models/nutrition.model';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-analysis-view',
  templateUrl: './analysis-view.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisViewComponent {
  private themeService = inject(ThemeService);
  theme = this.themeService.activeTheme;

  analysisResult = input.required<AnalysisResult | null>();

  logFood = output<FoodItem>();
  discard = output<void>();

  portionPercentage = signal(100);

  adjustedResult = computed(() => {
    const result = this.analysisResult();
    if (!result) return null;

    const multiplier = this.portionPercentage() / 100;
    return {
      ...result,
      calories: result.calories * multiplier,
      protein: result.protein * multiplier,
      carbohydrates: result.carbohydrates * multiplier,
      fat: result.fat * multiplier,
      sugar: result.sugar * multiplier,
    };
  });
  
  onSliderChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.portionPercentage.set(Number(value));
  }

  onLogFood() {
    const finalResult = this.adjustedResult();
    if (finalResult) {
      this.logFood.emit({
        ...finalResult,
        id: new Date().toISOString(), // Simple unique ID
      });
    }
  }

  onDiscard() {
    this.discard.emit();
  }
}
