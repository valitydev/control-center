import { Injectable, computed, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storageKey = 'theme';

    theme = signal<Theme>(this.getStoredTheme());
    isDark = computed(
        () => this.theme() === 'dark' || (this.theme() === 'system' && this.isSystemDark()),
    );

    constructor() {
        effect(() => this.updateTheme(this.isDark()));
        this.listenToSystemThemeChanges();
    }

    setTheme(theme: Theme) {
        this.theme.set(theme);
        localStorage.setItem(this.storageKey, theme);
        this.updateTheme();
    }

    private getStoredTheme(): Theme {
        const stored = localStorage.getItem(this.storageKey) as Theme;
        return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    }

    private updateTheme(isDark = this.isDark()) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    private isSystemDark(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private listenToSystemThemeChanges() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.theme() === 'system') {
                this.updateTheme();
            }
        });
    }
}
