import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { DomainObjectType, PartyConfigObject } from '@vality/domain-proto/domain';
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

import { FetchFullDomainObjectsService } from '~/api/domain-config';

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
        map((objs) => objs.map((obj) => obj.object.party_config)),
    );
    columns: Column<PartyConfigObject>[] = [
        {
            field: 'id',
            cell: (party) => ({ value: party.ref.id }),
        },
        {
            field: 'email',
            cell: (party) => ({
                value: party.data.contact_info.registration_email,
                description: (party.data.contact_info.manager_contact_emails || [])
                    .filter(Boolean)
                    .join(', '),
                link: () => `/parties/${party.ref.id}`,
            }),
        },
        {
            field: 'blocking',
            cell: (party) => ({
                value: startCase(getUnionKey(party.data.block)),
                color: (
                    {
                        blocked: 'warn',
                        unblocked: 'success',
                    } as const
                )[getUnionKey(party.data.block)],
            }),
        },
        {
            field: 'suspension',
            cell: (party) => ({
                value: startCase(getUnionKey(party.data.suspension)),
                color: (
                    {
                        suspended: 'warn',
                        active: 'success',
                    } as const
                )[getUnionKey(party.data.suspension)],
            }),
        },
        {
            field: 'shops',
            cell: (party) => ({
                value: party.data.shops.length,
                link: () => `/parties/${party.ref.id}/shops`,
            }),
        },
        createMenuColumn((party) => ({
            items: [
                {
                    label: 'Details',
                    click: () => this.router.navigate([`/parties/${party.ref.id}`]),
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
