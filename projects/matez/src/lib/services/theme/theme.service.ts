import { fromEvent, map } from 'rxjs';

import { Injectable, computed, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storageKey = 'theme';
    private isSystemDark = toSignal(
        fromEvent<MediaQueryListEvent>(
            window.matchMedia('(prefers-color-scheme: dark)'),
            'change',
        ).pipe(map((event) => event.matches)),
        { initialValue: window.matchMedia('(prefers-color-scheme: dark)').matches },
    );

    theme = signal<Theme>(this.getStoredTheme());
    isDark = computed(
        () => this.theme() === 'dark' || (this.theme() === 'system' && this.isSystemDark()),
    );

    constructor() {
        effect(() => this.updateTheme(this.isDark()));
    }

    setTheme(theme: Theme) {
        this.theme.set(theme);
        localStorage.setItem(this.storageKey, theme);
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
}
