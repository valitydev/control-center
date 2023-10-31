import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Party } from '@vality/deanonimus-proto/deanonimus';
import { Column, createOperationColumn } from '@vality/ng-core';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { FetchPartiesService } from '@cc/app/shared/services/fetch-parties.service';

import { getUnionKey } from '../../../utils';

import { SearchPartiesService } from './search-parties.service';

@Component({
    templateUrl: 'search-parties.component.html',
    styleUrls: ['search-parties.component.scss'],
    providers: [SearchPartiesService, FetchPartiesService],
})
export class SearchPartiesComponent {
    initSearchParams$ = this.partiesService.data$.pipe(map((p) => p?.text ?? ''));
    inProgress$ = this.fetchPartiesService.inProgress$;
    parties$ = this.fetchPartiesService.parties$;
    columns: Column<Party>[] = [
        {
            field: 'email',
            description: 'id',
            pinned: 'left',
            link: (party) => `/party/${party.id}`,
        },
        {
            field: 'blocking',
            type: 'tag',
            formatter: (party) => getUnionKey(party.blocking),
            typeParameters: {
                label: (party) => startCase(getUnionKey(party.blocking)),
                tags: {
                    blocked: { color: 'warn' },
                    unblocked: { color: 'success' },
                },
            },
        },
        {
            field: 'suspension',
            type: 'tag',
            formatter: (party) => getUnionKey(party.suspension),
            typeParameters: {
                label: (party) => startCase(getUnionKey(party.suspension)),
                tags: {
                    suspended: { color: 'warn' },
                    active: { color: 'success' },
                },
            },
        },
        {
            field: 'shops',
            formatter: (party) => party.shops.size,
        },
        createOperationColumn([
            {
                label: 'Details',
                click: (party) => {
                    this.router.navigate([`/party/${party.id}`]);
                },
            },
        ]),
    ];

    constructor(
        private partiesService: SearchPartiesService,
        private fetchPartiesService: FetchPartiesService,
        private router: Router,
    ) {}

    searchParamsUpdated(filter: string) {
        this.partiesService.preserve({ text: filter });
        this.fetchPartiesService.searchParties(filter);
    }
}
