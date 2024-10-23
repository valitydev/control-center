import { Component, Input, Output, EventEmitter, booleanAttribute, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Claim } from '@vality/domain-proto/claim_management';
import { Column, createMenuColumn, LoadOptions } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import { startCase } from 'lodash-es';

import { createPartyColumn } from '@cc/app/shared';

@Component({
    selector: 'cc-claims-table',
    templateUrl: './claims-table.component.html',
    styleUrls: ['./claims-table.component.scss'],
})
export class ClaimsTableComponent {
    @Input() data!: Claim[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    noParty = input(false, { transform: booleanAttribute });

    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column<Claim>[] = [
        { field: 'id', cell: (d) => ({ link: () => `/party/${d.party_id}/claim/${d.id}` }) },
        createPartyColumn((d) => ({ id: d.party_id }), { hidden: toObservable(this.noParty) }),
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getUnionKey(d.status)),
                color: (
                    {
                        pending: 'pending',
                        review: 'pending',
                        pending_acceptance: 'pending',
                        accepted: 'success',
                        denied: 'warn',
                        revoked: 'neutral',
                    } as const
                )[getUnionKey(d.status)],
            }),
        },
        { field: 'revision' },
        { field: 'created_at', cell: { type: 'datetime' } },
        { field: 'updated_at', cell: { type: 'datetime' } },
        createMenuColumn((d) => ({
            items: [
                {
                    label: 'Details',
                    link: () => `/party/${d.party_id}/claim/${d.id}`,
                },
            ],
        })),
    ];
}
