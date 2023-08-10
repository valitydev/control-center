import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Claim, ClaimStatus } from '@vality/domain-proto/claim_management';
import { Column, LoadOptions, TagColumn, createOperationColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { getUnionKey } from '../../../../utils';
import { PartiesStoreService } from '../../../api/payment-processing';

@Component({
    selector: 'cc-claims-table',
    templateUrl: './claims-table.component.html',
    styleUrls: ['./claims-table.component.scss'],
})
export class ClaimsTableComponent {
    @Input() data!: Claim[];
    @Input() isLoading?: boolean | null;
    @Input() hasMore?: boolean | null;

    @Output() update = new EventEmitter<LoadOptions>();
    @Output() more = new EventEmitter<void>();

    columns: Column<Claim>[] = [
        { field: 'id', pinned: 'left' },
        {
            field: 'party',
            description: 'party_id',
            formatter: (claim) =>
                this.partiesStoreService.get(claim.party_id).pipe(map((p) => p.contact_info.email)),
        },
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

    constructor(
        private router: Router,
        private partiesStoreService: PartiesStoreService,
    ) {}

    navigateToClaim(partyId: string, claimID: number) {
        void this.router.navigate([`/party/${partyId}/claim/${claimID}`]);
    }
}
