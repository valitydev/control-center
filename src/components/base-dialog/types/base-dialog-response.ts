import { BaseDialogResponseStatus } from '@cc/components/base-dialog';

export interface BaseDialogResponse<T = void, S = void> {
    status: S | BaseDialogResponseStatus;
    data?: T;
    error?: unknown;
}
