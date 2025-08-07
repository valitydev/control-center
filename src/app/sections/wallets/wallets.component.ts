import { Component, OnInit, inject } from '@angular/core';
import { DomainObjectType, WalletConfig } from '@vality/domain-proto/domain';
import { Column, DebounceTime, UpdateOptions } from '@vality/matez';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MemoizeExpiring } from 'typescript-memoize';

import { FetchFullDomainObjectsService } from '../../../api/domain-config';
import { createPartyColumn } from '../../../utils';
import { PartyStoreService } from '../party';

@Component({
    selector: 'cc-wallets',
    templateUrl: './wallets.component.html',
    providers: [PartyStoreService, FetchFullDomainObjectsService],
    standalone: false,
})
export class WalletsComponent implements OnInit {
    private fetchFullDomainObjectsService = inject(FetchFullDomainObjectsService);
    private partyStoreService = inject(PartyStoreService);

    wallets$ = this.fetchFullDomainObjectsService.result$.pipe(
        map((objs) => objs.map((obj) => obj.object.wallet_config.data)),
    );
    isLoading$ = this.fetchFullDomainObjectsService.isLoading$;

    columns: Column<WalletConfig>[] = [
        { field: 'id' },
        { field: 'name' },
        createPartyColumn((d) => ({ id: d.party_id })),
        // createCurrencyColumn(
        //     (d) =>
        //         this.getBalance(d.id).pipe(
        //             map((b) => ({ amount: b.current, code: b.currency.symbolic_code })),
        //         ),
        //     { header: 'Balance', isLazyCell: true },
        // ),
        // createCurrencyColumn(
        //     (d) =>
        //         this.getBalance(d.id).pipe(
        //             map((b) => ({
        //                 amount: b.current - b.expected_min,
        //                 code: b.currency.symbolic_code,
        //             })),
        //         ),
        //     { header: 'Hold', isLazyCell: true },
        // ),
        // createCurrencyColumn(
        //     (d) =>
        //         this.getBalance(d.id).pipe(
        //             map((b) => ({ amount: b.expected_min, code: b.currency.symbolic_code })),
        //         ),
        //     { header: 'Expected Min', isLazyCell: true },
        // ),
    ];
    party$ = this.partyStoreService.party$;

    ngOnInit() {
        this.fetchFullDomainObjectsService.load({
            type: DomainObjectType.wallet_config,
            query: '',
        });
    }

    @DebounceTime()
    search(query: string) {
        this.fetchFullDomainObjectsService.load({ query, type: DomainObjectType.wallet_config });
    }

    reload(options: UpdateOptions) {
        this.fetchFullDomainObjectsService.reload(options);
    }

    more() {
        this.fetchFullDomainObjectsService.more();
    }

    @MemoizeExpiring(5 * 60_000)
    getBalance(_walletId: string) {
        // TODO
        return of({});
        // return this.walletManagementService.GetAccountBalance(walletId).pipe(
        //     catchError((err) => {
        //         console.error(err);
        //         return of<Partial<AccountBalance>>({});
        //     }),
        //     shareReplay({ refCount: true, bufferSize: 1 }),
        // );
    }
}
