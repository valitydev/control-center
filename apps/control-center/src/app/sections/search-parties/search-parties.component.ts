import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Party } from '@vality/deanonimus-proto/deanonimus';
import {
    Column,
    DebounceTime,
    QueryParamsService,
    UpdateOptions,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { FetchPartiesService } from '../../shared/services/fetch-parties.service';

@Component({
    templateUrl: 'search-parties.component.html',
    styleUrls: ['search-parties.component.scss'],
    providers: [FetchPartiesService],
    standalone: false,
})
export class SearchPartiesComponent {
    private qp = inject<QueryParamsService<{ text: string }>>(QueryParamsService<{ text: string }>);
    private fetchPartiesService = inject(FetchPartiesService);
    private router = inject(Router);
    initSearchParams$ = this.qp.params$.pipe(map((p) => p?.text ?? ''));
    inProgress$ = this.fetchPartiesService.isLoading$;
    parties$ = this.fetchPartiesService.result$;
    columns: Column<Party>[] = [
        { field: 'id' },
        {
            field: 'email',
            cell: (party) => ({ link: () => `/party/${party.id}` }),
        },
        {
            field: 'blocking',
            cell: (party) => ({
                value: startCase(getUnionKey(party.blocking)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(party.blocking)],
            }),
        },
        {
            field: 'suspension',
            cell: (party) => ({
                value: startCase(getUnionKey(party.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(party.suspension)],
            }),
        },
        {
            field: 'shops',
            cell: (party) => ({ value: party.shops.size }),
        },
        createMenuColumn((party) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.router.navigate([`/party/${party.id}`]),
                },
            ],
        })),
    ];

    @DebounceTime()
    searchParamsUpdated(filter: string) {
        void this.qp.set({ text: filter });
        this.fetchPartiesService.load(filter);
    }

    reload(options: UpdateOptions) {
        this.fetchPartiesService.reload(options);
    }
}
