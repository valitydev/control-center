import { BaseDialogResponseStatus } from './base-dialog-response-status';

export interface BaseDialogResponse<T = void, S = void> {
    status: S | BaseDialogResponseStatus;
    data?: T;
    error?: unknown;
}
