import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DomainObjectType, PartyConfig } from '@vality/domain-proto/domain';
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

import { FetchFullDomainObjectsService } from '../../api/domain-config';

@Component({
    templateUrl: 'search-parties.component.html',
    styleUrls: ['search-parties.component.scss'],
    providers: [FetchFullDomainObjectsService],
    standalone: false,
})
export class SearchPartiesComponent implements OnInit {
    private qp = inject<QueryParamsService<{ text: string }>>(QueryParamsService<{ text: string }>);
    private fetchFullDomainObjectsService = inject(FetchFullDomainObjectsService);
    private router = inject(Router);
    initSearchParams$ = this.qp.params$.pipe(map((p) => p?.text ?? ''));
    inProgress$ = this.fetchFullDomainObjectsService.isLoading$;
    parties$ = this.fetchFullDomainObjectsService.result$.pipe(
        map((objs) => objs.map((obj) => obj.object.party_config.data)),
    );
    columns: Column<PartyConfig>[] = [
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
            cell: (party) => ({ value: party.shops.length }),
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

    ngOnInit() {
        this.searchParamsUpdated(this.qp.params.text);
    }

    @DebounceTime()
    searchParamsUpdated(filter: string) {
        void this.qp.set({ text: filter });
        this.fetchFullDomainObjectsService.load({
            query: filter,
            type: DomainObjectType.party_config,
        });
    }

    reload(options: UpdateOptions) {
        this.fetchFullDomainObjectsService.reload(options);
    }
}
