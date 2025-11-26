import { Component, ChangeDetectionStrategy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeminiService } from './services/gemini.service';
import { PersistenceService } from './services/persistence.service';
import { ThemeService } from './services/theme.service';
import { OpenFoodFactsService } from './services/open-food-facts.service';
import { AnalysisResult, DailyGoals, FoodItem } from './models/nutrition.model';
import { DashboardViewComponent } from './components/dashboard-view/dashboard-view.component';
import { CameraViewComponent } from './components/camera-view/camera-view.component';
import { AnalysisViewComponent } from './components/analysis-view/analysis-view.component';
import { GoalSettingsComponent } from './components/goal-settings/goal-settings.component';
import { RadarChartComponent } from './components/radar-chart/radar-chart.component';
import { BarcodeScannerComponent } from './components/barcode-scanner/barcode-scanner.component';


type AppView = 'dashboard' | 'camera' | 'analysis' | 'settings' | 'barcode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    DashboardViewComponent,
    CameraViewComponent,
    AnalysisViewComponent,
    GoalSettingsComponent,
    RadarChartComponent,
    BarcodeScannerComponent,
  ],
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  private persistenceService = inject(PersistenceService);
  private themeService = inject(ThemeService); // Initialize theme service
  private foodDbService = inject(OpenFoodFactsService);
  
  currentView = signal<AppView>('dashboard');
  isLoading = signal(false);
  analysisResult = signal<AnalysisResult | null>(null);
  error = signal<string | null>(null);

  // Sample daily log
  dailyLog = signal<FoodItem[]>([]);
  
  // Load goals from storage or use defaults
  dailyGoals = signal<DailyGoals>(
    this.persistenceService.loadGoals() ?? {
      calories: 2200,
      protein: 150,
      carbohydrates: 250,
      fat: 70
    }
  );

  constructor() {
    effect(() => {
      // This effect runs whenever the error signal in either service changes.
      const geminiError = this.geminiService.error();
      const foodDbError = this.foodDbService.error();
      
      // Prioritize showing an error from a service if it exists.
      if (geminiError) {
        this.error.set(geminiError);
      } else if (foodDbError) {
        this.error.set(foodDbError);
      }
    });
  }

  async onImageCaptured(base64String: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentView.set('camera'); // Stay on camera view with loader
    const result = await this.geminiService.analyzeImage(base64String);
    if (result) {
      this.analysisResult.set(result);
      this.currentView.set('analysis');
    } else {
        this.currentView.set('dashboard'); // Go back to dash on error
    }
    this.isLoading.set(false);
  }

  async onBarcodeScanned(barcode: string) {
    this.isLoading.set(true);
    this.error.set(null);
    const result = await this.foodDbService.getProductByBarcode(barcode);
    if (result) {
        this.analysisResult.set(result);
        this.currentView.set('analysis');
    } else {
        this.currentView.set('dashboard');
    }
    this.isLoading.set(false);
  }
  
  onScanError(errorMessage: string) {
      this.error.set(errorMessage);
      this.currentView.set('dashboard');
  }

  onLogFood(foodItem: FoodItem) {
    this.dailyLog.update(log => [...log, foodItem]);
    this.currentView.set('dashboard');
    this.analysisResult.set(null);
  }

  onDiscardAnalysis() {
    this.currentView.set('camera');
    this.analysisResult.set(null);
  }

  onGoalsSaved(newGoals: DailyGoals) {
    this.dailyGoals.set(newGoals);
    this.persistenceService.saveGoals(newGoals);
    this.currentView.set('dashboard');
  }

  clearError() {
      this.error.set(null);
      this.geminiService.error.set(null);
      this.foodDbService.error.set(null);
  }

  changeView(view: AppView) {
    this.currentView.set(view);
  }
}