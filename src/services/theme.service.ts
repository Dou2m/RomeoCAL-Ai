import { Injectable, signal, inject } from '@angular/core';
import { PersistenceService } from './persistence.service';
import { ColorTheme, COLOR_THEMES } from '../models/theme.model';

const DEFAULT_THEME_KEY = 'sky';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private persistenceService = inject(PersistenceService);
  
  private themes = signal<ColorTheme[]>(COLOR_THEMES);
  public activeTheme = signal<ColorTheme>(this.getThemeByKey(DEFAULT_THEME_KEY)!);

  constructor() {
    const savedThemeKey = this.persistenceService.loadTheme();
    if (savedThemeKey) {
        const savedTheme = this.getThemeByKey(savedThemeKey);
        if (savedTheme) {
            this.activeTheme.set(savedTheme);
        }
    }
  }
  
  getThemes(): ColorTheme[] {
    return this.themes();
  }

  setTheme(themeKey: string): void {
    const newTheme = this.getThemeByKey(themeKey);
    if (newTheme) {
        this.activeTheme.set(newTheme);
        this.persistenceService.saveTheme(themeKey);
    }
  }

  private getThemeByKey(key: string): ColorTheme | undefined {
    return this.themes().find(t => t.key === key);
  }
}
