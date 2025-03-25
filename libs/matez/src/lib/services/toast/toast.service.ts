import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { DEFAULT_DURATION, ToastComponent, ToastData } from './toast.component';

@Injectable({
    providedIn: 'root',
})
export class ToastService {
    constructor(private snackBar: MatSnackBar) {}

    open(data: ToastData, config: Omit<MatSnackBarConfig<ToastData>, 'data'> = {}) {
        return this.snackBar.openFromComponent<ToastComponent, ToastData>(ToastComponent, {
            ...config,
            duration: data.progress$ ? config.duration : (data.duration ?? DEFAULT_DURATION),
            data,
        });
    }
}
