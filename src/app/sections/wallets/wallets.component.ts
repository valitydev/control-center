import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { clean, splitIds } from '@vality/ng-core';
import { startWith, map } from 'rxjs/operators';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { QueryParamsService } from '@cc/app/shared/services';
import {
    createDatetimeFormattedColumn,
    createDescriptionFormattedColumn,
    createGridColumns,
} from '@cc/components/simple-table';

import { FetchWalletsService } from './fetch-wallets.service';

@UntilDestroy()
@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    styles: [
        `
            :host {
                display: block;
                padding: 24px 16px;
            }
        `,
    ],
    providers: [FetchWalletsService],
})
export class WalletsComponent implements OnInit {
    wallets$ = this.fetchWalletsService.searchResult$;
    inProgress$ = this.fetchWalletsService.doAction$;
    hasMore$ = this.fetchWalletsService.hasMore$;
    columns = createGridColumns([
        createDescriptionFormattedColumn('name', 'id'),
        'currency_symbolic_code',
        'identity_id',
        createDatetimeFormattedColumn('created_at'),
    ]);
    filters = this.fb.group<WalletParams>({
        party_id: null,
        identity_id: null,
        currency_code: null,
        wallet_id: null,
        ...this.qp.params,
    });

    constructor(
        private fetchWalletsService: FetchWalletsService,
        private qp: QueryParamsService<WalletParams>,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                startWith(this.filters.value),
                map((v) => ({ ...v, wallet_id: splitIds(v.wallet_id) })),
                map((v) => clean(v)),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                void this.qp.set(value);
                this.search();
            });
    }

    search(size?: number) {
        const { wallet_id, ...v } = this.filters.value;
        this.fetchWalletsService.search(clean({ ...v, wallet_id: splitIds(wallet_id) }), size);
    }

    fetchMore() {
        this.fetchWalletsService.fetchMore();
    }
}
