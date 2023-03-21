import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StatWallet } from '@vality/fistful-proto/internal/fistful_stat';

import { FetchWalletsService } from './fetch-wallets.service';
import { Schema } from './simple-table/simple-table.component';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
})
export class WalletsComponent {
    wallets$ = this.fetchWalletsService.searchResult$;
    inProgress$ = this.fetchWalletsService.doAction$;
    hasMore$ = this.fetchWalletsService.hasMore$;
    schema = new Schema<StatWallet>([
        { label: 'Name', value: 'name', description: 'id' },
        'currency_symbolic_code',
        'identity_id',
        { value: 'created_at', type: 'datetime' },
    ]);
    control = new FormGroup({});

    constructor(private fetchWalletsService: FetchWalletsService) {
        this.fetchWalletsService.search({});
    }

    fetchMore() {
        this.fetchWalletsService.fetchMore();
    }
}
