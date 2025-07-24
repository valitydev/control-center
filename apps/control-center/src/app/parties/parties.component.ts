import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { DomainObjectType, PartyConfig } from '@vality/domain-proto/domain';
import {
    Column,
    DebounceTime,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    createMenuColumn,
} from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { FetchFullDomainObjectsService } from '../api/domain-config';
import { PageLayoutModule } from '../shared';

@Component({
    templateUrl: 'parties.component.html',
    styleUrls: ['parties.component.scss'],
    providers: [FetchFullDomainObjectsService],
    imports: [MatCardModule, CommonModule, MatProgressBarModule, PageLayoutModule, TableModule],
})
export class PartiesComponent implements OnInit {
    private qp = inject<QueryParamsService<{ text: string }>>(QueryParamsService<{ text: string }>);
    private fetchFullDomainObjectsService = inject(FetchFullDomainObjectsService);
    private router = inject(Router);

    initSearchParams$ = this.qp.params$.pipe(map((p) => p?.text ?? ''));
    inProgress$ = this.fetchFullDomainObjectsService.isLoading$;
    parties$ = this.fetchFullDomainObjectsService.result$.pipe(
        map((objs) => objs.map((obj) => obj.object.party_config.data)),
    );
    columns: Column<PartyConfig>[] = [
        {
            field: 'id',
            cell: (party) => ({ value: party.id }),
        },
        {
            field: 'email',
            cell: (party) => ({
                value: party.contact_info.registration_email,
                description: (party.contact_info.manager_contact_emails || [])
                    .filter(Boolean)
                    .join(', '),
                link: () => `/parties/${party.id}`,
            }),
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
            cell: (party) => ({
                value: party.shops.length,
                link: () => `/parties/${party.id}/shops`,
            }),
        },
        createMenuColumn((party) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.router.navigate([`/parties/${party.id}`]),
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

    more() {
        this.fetchFullDomainObjectsService.more();
    }
}
