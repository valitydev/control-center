import { Injectable } from '@angular/core';

import { NotificationService } from '../notification';

// TODO: collect error information
@Injectable({ providedIn: 'root' })
export class ErrorService {
    constructor(private notificationService: NotificationService) {}

    error = (error: any, message?: string) => {
        // TODO: parse error by instance for error clarification (message)
        if (!message) {
            message = error.name || error.message;
            if (message && message !== error.message) {
                message += ` (${String(error.message)})`;
            }
        }
        return this.notificationService.error('Error' + (message ? `: ${message}` : ''));
    };
}
