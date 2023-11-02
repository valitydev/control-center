import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { Column, createOperationColumn, UpdateOptions } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { filter } from 'rxjs/operators';

import { getUnionKey } from '../../../utils';
import { createCurrencyColumn } from '../../shared';

import { CreateDepositDialogComponent } from './create-deposit-dialog/create-deposit-dialog.component';
import { FetchDepositsService } from './services/fetch-deposits/fetch-deposits.service';
import { ParamsStoreService } from './services/params-store/params-store.service';
import { SearchParams } from './types/search-params';

@UntilDestroy()
@Component({
    templateUrl: 'deposits.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ParamsStoreService, FetchDepositsService],
})
export class DepositsComponent implements OnInit {
    initParams$ = this.paramsStoreService.data$;

    deposits$ = this.fetchDepositsService.searchResult$;
    hasMore$ = this.fetchDepositsService.hasMore$;
    doAction$ = this.fetchDepositsService.doAction$;
    columns: Column<StatDeposit>[] = [
        {
            field: 'id',
            link: (d) => `/deposits/${d.id}`,
        },
        {
            field: 'status',
            type: 'tag',
            formatter: (d) => getUnionKey(d.status),
            typeParameters: {
                label: (d) => startCase(getUnionKey(d.status)),
                tags: {
                    pending: { color: 'pending' },
                    succeeded: { color: 'success' },
                    failed: { color: 'warn' },
                },
            },
        },
        {
            field: 'created_at',
            type: 'datetime',
        },
        {
            field: 'destination_id',
        },
        createCurrencyColumn(
            'amount',
            (d) => d.amount,
            (d) => d.currency_symbolic_code,
        ),
        createOperationColumn([
            {
                label: 'Details',
                click: (d) => this.router.navigate([`/deposits/${d.id}`]),
            },
        ]),
    ];

    constructor(
        private dialog: MatDialog,
        private paramsStoreService: ParamsStoreService,
        private fetchDepositsService: FetchDepositsService,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}

    ngOnInit() {
        this.fetchDepositsService.errors$.subscribe((e) =>
            this.snackBar.open(`An error occurred while search deposits (${String(e)})`, 'OK'),
        );
    }

    createDeposit() {
        this.dialog
            .open(CreateDepositDialogComponent, { width: '552px', disableClose: true })
            .afterClosed()
            .pipe(
                filter((deposit) => !!deposit),
                untilDestroyed(this),
            )
            .subscribe(() => {
                this.refresh();
            });
    }

    searchParamsUpdated(params: SearchParams) {
        this.paramsStoreService.preserve(params);
        this.fetchDepositsService.search(params);
    }

    refresh(_options?: UpdateOptions) {
        this.fetchDepositsService.refresh();
    }

    fetchMore() {
        this.fetchDepositsService.fetchMore();
    }
}
