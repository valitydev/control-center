import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { Observable, combineLatest, map, of, shareReplay } from 'rxjs';

export const DEFAULT_DURATION = 3000;

export interface ToastData {
    message?: string;
    action?: () => void;

    /** Duration after progress or if not set, duration of the snackbar */
    duration?: number;

    progress$?: Observable<boolean>;
    progressMessage?: string;

    successMessage?: string;

    error$?: Observable<unknown>;
    errorMessage?: string;
}

@Component({
    selector: 'v-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
})
export class ToastComponent {
    public data = inject<ToastData>(MAT_SNACK_BAR_DATA);
    private snackBarRef = inject<MatSnackBarRef<ToastComponent>>(MatSnackBarRef<ToastComponent>);
    message$ = combineLatest([this.data.progress$ ?? of(false), this.data.error$ ?? of(null)]).pipe(
        map(([progress, error]) => {
            if (error) {
                return this.data.errorMessage ?? this.data.message;
            } else if (progress) {
                return this.data.progressMessage ?? this.data.message;
            }
            return this.data.message;
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor() {
        this.subscribeProgress();
        if (!this.data.progress$) {
            this.dismissByDuration();
        }
    }

    dismissWithAction() {
        this.data.action?.();
        this.snackBarRef.dismissWithAction();
    }

    private subscribeProgress() {
        if (this.data.progress$) {
            let started = false;
            this.data.progress$.subscribe((progress) => {
                if (!started && progress) {
                    started = true;
                } else if (started && !progress) {
                    this.dismissByDuration();
                }
            });
        }
    }

    private dismissByDuration() {
        if (this.data.duration && this.data.duration < Number.MAX_SAFE_INTEGER) {
            setTimeout(() => {
                this.snackBarRef.dismiss();
            }, this.data.duration ?? DEFAULT_DURATION);
        }
    }
}
