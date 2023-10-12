import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Shop } from '@vality/domain-proto/domain';
import { Column, createOperationColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';

import { getUnionKey } from '@cc/utils';

import { PartyShopsService } from './party-shops.service';

@Component({
    templateUrl: 'party-shops.component.html',
    providers: [PartyShopsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartyShopsComponent {
    shops$ = this.partyShopsService.shops$;
    columns: Column<Shop>[] = [
        {
            field: 'details.name',
            description: 'id',
            link: (shop) => `/party/${this.route.snapshot.params.partyID}/shop/${shop.id}`,
            pinned: 'left',
        },
        {
            field: 'details.description',
        },
        {
            field: 'location.url',
        },
        {
            field: 'account.currency.symbolic_code',
            header: 'Currency',
        },
        {
            field: 'blocking',
            type: 'tag',
            formatter: (shop) => getUnionKey(shop.blocking),
            typeParameters: {
                label: (shop) => startCase(getUnionKey(shop.blocking)),
                tags: {
                    blocked: { color: 'warn' },
                    unblocked: { color: 'success' },
                },
            },
        },
        {
            field: 'suspension',
            type: 'tag',
            formatter: (shop) => getUnionKey(shop.suspension),
            typeParameters: {
                label: (shop) => startCase(getUnionKey(shop.suspension)),
                tags: {
                    suspended: { color: 'warn' },
                    active: { color: 'success' },
                },
            },
        },
        createOperationColumn([
            {
                label: 'Details',
                click: (shop) => {
                    this.router.navigate([
                        `/party/${this.route.snapshot.params.partyID}/shop/${shop.id}`,
                    ]);
                },
            },
        ]),
    ];

    constructor(
        private partyShopsService: PartyShopsService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}
}
