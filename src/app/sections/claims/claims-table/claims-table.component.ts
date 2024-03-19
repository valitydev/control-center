import {
    Component,
    Input,
    Output,
    EventEmitter,
    booleanAttribute,
    input,
    computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { Claim, ClaimStatus } from '@vality/domain-proto/claim_management';
import { Column, LoadOptions, TagColumn, createOperationColumn } from '@vality/ng-core';
import isObject from 'lodash-es/isObject';
import startCase from 'lodash-es/startCase';

import { getUnionKey } from '../../../../utils';
import { createPartyColumn } from '../../../shared';

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

    columns = computed<Column<Claim>[]>(() =>
        this.sourceColumns.filter(
            (c) => (isObject(c) && c?.field !== 'party_id') || !this.noParty(),
        ),
    );
    private sourceColumns: Column<Claim>[] = [
        { field: 'id', link: (d) => this.getClaimLink(d.party_id, d.id) },
        createPartyColumn('party_id'),
        {
            field: 'status',
            type: 'tag',
            formatter: (claim) => getUnionKey(claim.status),
            typeParameters: {
                label: (claim) => startCase(getUnionKey(claim.status)),
                tags: {
                    pending: { color: 'pending' },
                    review: { color: 'pending' },
                    pending_acceptance: { color: 'pending' },
                    accepted: { color: 'success' },
                    denied: { color: 'warn' },
                    revoked: { color: 'neutral' },
                },
            },
        } as TagColumn<Claim, keyof ClaimStatus>,
        'revision',
        { field: 'created_at', type: 'datetime' },
        { field: 'updated_at', type: 'datetime' },
        createOperationColumn<Claim>([
            {
                label: 'Details',
                click: (claim) => this.navigateToClaim(claim.party_id, claim.id),
            },
        ]),
    ];

    constructor(private router: Router) {}

    navigateToClaim(partyId: string, claimID: number) {
        void this.router.navigate([this.getClaimLink(partyId, claimID)]);
    }

    private getClaimLink(partyId: string, claimID: number): string {
        return `/party/${partyId}/claim/${claimID}`;
    }
}
