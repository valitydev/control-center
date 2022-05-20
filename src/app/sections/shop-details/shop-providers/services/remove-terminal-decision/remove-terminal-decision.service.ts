import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, EMPTY, merge, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';
import { BaseDialogResponseStatus } from '@cc/components/base-dialog';
import { BaseDialogService } from '@cc/components/base-dialog/services/base-dialog.service';
import { ConfirmActionDialogComponent } from '@cc/components/confirm-action-dialog';

import { ProviderService } from '../../../../../thrift-services/damsel';
import { DomainStoreService } from '../../../../../thrift-services/damsel/domain-store.service';
import { createRemoveTerminalFromShopCommit } from '../../../../../thrift-services/damsel/operations/create-remove-terminal-from-shop-commit';
import { RemoveTerminalFromShopParams } from '../../../../../thrift-services/damsel/operations/remove-terminal-from-shop-params';
import { ChangeProviderParams } from '../../types';

@Injectable()
export class RemoveTerminalDecisionService {
    private remove$ = new Subject<ChangeProviderParams>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    error$ = new Subject<void>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    cancelled$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    terminalRemoved$ = this.remove$.pipe(
        switchMap((params) =>
            combineLatest([
                of(params),
                this.baseDialogService
                    .open(ConfirmActionDialogComponent, {
                        title: `Remove this terminal from shop?`,
                    })
                    .afterClosed()
                    .pipe(
                        filter(({ status }) => {
                            if (status === BaseDialogResponseStatus.Cancelled) {
                                this.cancelled$.next();
                            }
                            return status === BaseDialogResponseStatus.Success;
                        })
                    ),
            ])
        ),
        switchMap(([params]) =>
            this.providerService.getProviderFromParams<RemoveTerminalFromShopParams>(params)
        ),
        map(([params, providerObject]) =>
            createRemoveTerminalFromShopCommit(providerObject, params)
        ),
        switchMap((commit) =>
            this.domainStoreService.commit(commit).pipe(
                catchError(() => {
                    this.error$.next();
                    return EMPTY;
                })
            )
        ),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(
        this.remove$,
        merge(this.terminalRemoved$, this.error$, this.cancelled$)
    );

    constructor(
        private baseDialogService: BaseDialogService,
        private snackBar: MatSnackBar,
        private domainStoreService: DomainStoreService,
        private providerService: ProviderService
    ) {
        this.terminalRemoved$.subscribe();
        this.error$.subscribe(() => {
            this.snackBar.open('An error occurred while editing providerObject', 'OK');
        });
    }

    remove(params: ChangeProviderParams) {
        this.remove$.next(params);
    }
}
