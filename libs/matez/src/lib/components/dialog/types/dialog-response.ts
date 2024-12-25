import { DialogResponseStatus } from './dialog-response-status';

export interface DialogResponse<T = void, S = void> {
    status: S | DialogResponseStatus;
    data?: T;
    error?: unknown;
}
