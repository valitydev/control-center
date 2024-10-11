import {
    Component,
    Input,
    Output,
    EventEmitter,
    booleanAttribute,
    input,
    computed,
    runInInjectionContext,
    Injector,
} from '@angular/core';
import { Claim } from '@vality/domain-proto/claim_management';
import { Column2, LoadOptions, TABLE_WRAPPER_STYLE, createMenuColumn } from '@vality/ng-core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';

import { createPartyColumn } from '@cc/app/shared/utils/table2';

@Component({
    selector: 'cc-claims-table',
    templateUrl: './claims-table.component.html',
    styleUrls: ['./claims-table.component.scss'],
    host: {
        style: TABLE_WRAPPER_STYLE,
    },
})
export class ClaimsTableComponent {
    @Input() data!: Claim[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;
    noParty = input(false, { transform: booleanAttribute });

    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns = computed<Column2<Claim>[]>(() =>
        runInInjectionContext(this.injector, () => [
            { field: 'id', cell: (d) => ({ link: () => `/party/${d.party_id}/claim/${d.id}` }) },
            createPartyColumn((d) => ({ id: d.party_id }), { hidden: this.noParty() }),
            {
                field: 'status',
                type: 'tag',
                cell: (d) => ({
                    value: startCase(getUnionKey(d.status)),
                    tags: {
                        pending: 'pending',
                        review: 'pending',
                        pending_acceptance: 'pending',
                        accepted: 'success',
                        denied: 'warn',
                        revoked: 'neutral',
                    },
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
        ]),
    );

    constructor(private injector: Injector) {}
}
