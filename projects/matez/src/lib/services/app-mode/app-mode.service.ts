import { Injectable, computed, effect, signal } from '@angular/core';

type AppMode = 'simple' | 'advanced';

@Injectable({
    providedIn: 'root',
})
export class AppModeService {
    mode = signal<AppMode>(this.getInitialMode());

    isSimple = computed(() => this.mode() === 'simple');
    isAdvanced = computed(() => this.mode() === 'advanced');

    constructor() {
        effect(() => {
            localStorage.setItem('app-mode', this.mode());
        });
    }

    private getInitialMode(): AppMode {
        const stored = localStorage.getItem('app-mode');
        return (stored as AppMode) || 'simple';
    }

    setMode(mode: AppMode): void {
        this.mode.set(mode);
    }
}
