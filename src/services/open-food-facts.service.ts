import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AnalysisResult } from '../models/nutrition.model';

interface OpenFoodFactsResponse {
  status: number;
  product: {
    product_name: string;
    nutriments: {
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      sugars_100g?: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class OpenFoodFactsService {
  private http = inject(HttpClient);
  public error = signal<string | null>(null);

  async getProductByBarcode(barcode: string): Promise<AnalysisResult | null> {
    this.error.set(null);
    const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

    try {
      const response = await lastValueFrom(this.http.get<OpenFoodFactsResponse>(url));

      if (response.status !== 1 || !response.product) {
        this.error.set(`Product with barcode ${barcode} not found.`);
        return null;
      }

      const product = response.product;
      const nutriments = product.nutriments;
      
      // Assume a standard serving size of 100g for simplicity
      const analysisResult: AnalysisResult = {
        mealName: product.product_name || 'Unnamed Product',
        calories: nutriments['energy-kcal_100g'] ?? 0,
        protein: nutriments.proteins_100g ?? 0,
        carbohydrates: nutriments.carbohydrates_100g ?? 0,
        fat: nutriments.fat_100g ?? 0,
        sugar: nutriments.sugars_100g ?? 0,
      };

      if (analysisResult.calories === 0 && analysisResult.protein === 0) {
          this.error.set(`Nutritional information for "${analysisResult.mealName}" is incomplete.`);
          return null;
      }

      return analysisResult;

    } catch (e: any) {
      console.error(`Error fetching product data for barcode ${barcode}`, e);
      this.error.set('Failed to connect to the food database. Please check your connection.');
      return null;
    }
  }
}
