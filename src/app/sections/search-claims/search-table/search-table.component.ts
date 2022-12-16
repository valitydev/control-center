import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Claim } from '@vality/domain-proto/claim_management';

@Component({
    selector: 'cc-search-table',
    templateUrl: './search-table.component.html',
    styleUrls: ['./search-table.component.scss'],
})
export class SearchTableComponent {
    @Input()
    claims: Claim[];

    displayedColumns = [
        'claimID',
        'party',
        'status',
        'revision',
        'updatedAt',
        'createdAt',
        'actions',
    ];

    constructor(private router: Router) {}

    navigateToClaim(partyId: string, claimID: number) {
        void this.router.navigate([`/party/${partyId}/claim/${claimID}`]);
    }
}
