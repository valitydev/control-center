import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly storageKey = 'theme';

    theme = signal<Theme>(this.getStoredTheme());

    constructor() {
        this.applyTheme(this.theme());
        this.listenToSystemThemeChanges();
    }

    setTheme(theme: Theme) {
        this.theme.set(theme);
        localStorage.setItem(this.storageKey, theme);
        this.applyTheme(theme);
    }

    private getStoredTheme(): Theme {
        const stored = localStorage.getItem(this.storageKey) as Theme;
        return stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
    }

    private applyTheme(theme: Theme) {
        const isDark = theme === 'dark' || (theme === 'system' && this.isSystemDark());

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
                this.applyTheme('system');
            }
        });
    }
}
