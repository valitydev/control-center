import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { capitalize } from 'lodash-es';
import { Observer, first, timeout } from 'rxjs';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../../utils';

import { DEFAULT_ERROR_NAME, LogError } from './log-error';
import { Operation } from './types/operation';

const DEFAULT_DURATION_MS = 3_000;
const DEFAULT_ERROR_DURATION_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class NotifyLogService {
    private snackBar = inject(MatSnackBar);
    success = (message: PossiblyAsync<string> = 'Completed successfully'): void => {
        this.notify(message);
    };

    error = (errors: unknown | unknown[], message?: PossiblyAsync<string>): void => {
        const logErrors = (Array.isArray(errors) ? errors : [errors]).map((e) => new LogError(e));
        message = message || (logErrors.length === 1 ? logErrors[0].message : DEFAULT_ERROR_NAME);
        this.subscribeWithTimeout(message, (msg) => {
            console.warn(
                [`Caught error: ${msg}.`, ...logErrors.map((e) => e.getLogMessage())].join('\n'),
            );
        });
        this.notify(message, DEFAULT_ERROR_DURATION_MS);
    };

    createErrorOperation(operation: Operation, objectName: string) {
        return (err: unknown) => this.errorOperation(err, operation, objectName);
    }

    successOperation(operation: Operation, objectName: string): void {
        let message!: string;
        switch (operation) {
            case 'create':
                message = `${capitalize(objectName)} created successfully`;
                break;
            case 'receive':
                message = `${capitalize(objectName)} received successfully`;
                break;
            case 'update':
                message = `${capitalize(objectName)} updated successfully`;
                break;
            case 'delete':
                message = `${capitalize(objectName)} deleted successfully`;
                break;
        }
        this.success(message);
    }

    errorOperation(errors: unknown | unknown[], operation: Operation, objectName: string) {
        let message!: string;
        switch (operation) {
            case 'create':
                message = `Error creating ${objectName}`;
                break;
            case 'receive':
                message = `Error retrieving ${objectName}`;
                break;
            case 'update':
                message = `Error updating ${objectName}`;
                break;
            case 'delete':
                message = `Error deleting ${objectName}`;
                break;
        }
        this.error(errors, message);
    }

    private notify(message: PossiblyAsync<string>, duration = DEFAULT_DURATION_MS) {
        this.subscribeWithTimeout(message, {
            next: (msg) => {
                this.snackBar.open(msg, 'OK', {
                    duration,
                });
            },
            error: () => {
                // TODO: Default message
            },
        });
    }

    private subscribeWithTimeout<T>(
        possiblyAsync: PossiblyAsync<T>,
        subscribe: Partial<Observer<T>> | Observer<T>['next'],
    ) {
        getPossiblyAsyncObservable(possiblyAsync)
            .pipe(first(), timeout(DEFAULT_TIMEOUT_MS))
            .subscribe(subscribe);
    }
}
