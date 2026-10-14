import { capitalize, isObject } from 'lodash-es';
import { Observer, first, map, timeout } from 'rxjs';

import { Injectable, InjectionToken, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PossiblyAsync, getPossiblyAsyncObservable } from '../../utils';

import { NotifySnackBarComponent, NotifySnackBarData } from './notify-snack-bar.component';
import { Operation } from './types/operation';

export interface LogError {
    name?: string;
    message?: string;
    details?: object;
    trace?: string;
    error?: unknown;
    noConsole?: boolean;
}

export type ErrorParser = (error: unknown) => LogError;

export const ERROR_PARSER = new InjectionToken<ErrorParser>('ErrorParser');

const DEFAULT_DURATION_MS = 3_000;
const DEFAULT_ERROR_DURATION_MS = 10_000;
const DEFAULT_TIMEOUT_MS = 10_000;
export const DEFAULT_ERROR_PARSER: ErrorParser = (error: unknown) => {
    const err = error instanceof Error ? error : isObject(error) ? error : new Error(String(error));
    return {
        ...err,
        name: 'name' in err ? String(err.name) : undefined,
        message: 'message' in err ? String(err.message) : undefined,
        error,
    };
};

@Injectable({ providedIn: 'root' })
export class NotifyLogService {
    private snackBar = inject(MatSnackBar);
    private parseError = inject(ERROR_PARSER, { optional: true }) || DEFAULT_ERROR_PARSER;

    success = (message: PossiblyAsync<string> = 'Completed successfully'): void => {
        this.notify(message);
    };

    error = (error: unknown, message?: PossiblyAsync<string>): void => {
        const parsedError = this.parseError(error);
        const errorMessage = parsedError.message || parsedError.name;
        message = message
            ? getPossiblyAsyncObservable(message).pipe(
                  map((msg) =>
                      errorMessage && errorMessage !== msg ? `${msg}: ${errorMessage}` : msg,
                  ),
              )
            : errorMessage || 'An error occurred';
        if (!parsedError.noConsole) {
            this.subscribeWithTimeout(message, (msg) => {
                console.warn(
                    [
                        `Caught error: ${msg}.`,
                        parsedError.name,
                        parsedError.message,
                        parsedError.details,
                    ].join('\n'),
                    parsedError.error,
                );
            });
        }
        this.notify(message, DEFAULT_ERROR_DURATION_MS, parsedError);
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

    private notify(
        message: PossiblyAsync<string>,
        duration = DEFAULT_DURATION_MS,
        error?: LogError,
    ) {
        this.subscribeWithTimeout(message, {
            next: (msg) => {
                if (error?.trace) {
                    this.snackBar.openFromComponent<NotifySnackBarComponent, NotifySnackBarData>(
                        NotifySnackBarComponent,
                        {
                            duration,
                            data: {
                                message: msg,
                                trace: error.trace,
                            },
                        },
                    );
                } else {
                    this.snackBar.open(msg, 'OK', {
                        duration,
                    });
                }
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
