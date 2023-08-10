import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ErrorService } from './types/error-service';

const DEFAULT_DURATION_MS = 6000;

@Injectable({ providedIn: 'root' })
export class NotificationErrorService implements ErrorService {
    constructor(private snackBar: MatSnackBar) {}

    error = (error: unknown, clientMessage?: string): void => {
        let result: string;
        const name = String((error as Record<PropertyKey, unknown>)?.['name'] ?? '');
        const message = String((error as Record<PropertyKey, unknown>)?.['message'] ?? '');

        if (clientMessage) {
            result = clientMessage;
        } else {
            result = message || name || 'Unknown error';
        }
        console.warn(
            [
                `❗️ Caught error: ${result}.`,
                name && `Name: ${name}.`,
                message && `Message: ${message}.`,
            ]
                .filter(Boolean)
                .join(' '),
        );
        this.snackBar.open(result, 'OK', {
            duration: DEFAULT_DURATION_MS,
        });
    };
}
