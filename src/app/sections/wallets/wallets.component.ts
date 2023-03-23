import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';
import { clean } from '@vality/ng-core';
import { startWith, map } from 'rxjs/operators';

import { WalletParams } from '@cc/app/api/fistful-stat/query-dsl/types/wallet';
import { QueryParamsService } from '@cc/app/shared/services';
import { Schema } from '@cc/components/simple-table';

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
})
export class WalletsComponent implements OnInit {
    wallets$ = this.fetchWalletsService.searchResult$;
    inProgress$ = this.fetchWalletsService.doAction$;
    hasMore$ = this.fetchWalletsService.hasMore$;
    schema = new Schema<StatWallet>([
        { value: 'name', description: 'id' },
        'currency_symbolic_code',
        'identity_id',
        { value: 'created_at', type: 'datetime' },
    ]);
    filters = this.fb.group<WalletParams>({
        party_id: null,
        identity_id: null,
        currency_code: null,
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
                map((v) => clean(v)),
                untilDestroyed(this)
            )
            .subscribe((value) => {
                void this.qp.set(value);
                this.fetchWalletsService.search(value);
            });
    }

    search(size: number) {
        this.fetchWalletsService.search(this.filters.value, size);
    }

    fetchMore() {
        this.fetchWalletsService.fetchMore();
    }
}
