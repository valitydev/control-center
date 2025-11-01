import { map, shareReplay } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import {
    Column,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    TableModule,
    cachedHeadMap,
    pagedObservableResource,
} from '@vality/matez';

import { ThriftRepositoryService } from '~/api/services';
import { MerchantFieldModule } from '~/components/merchant-field/merchant-field.module';
import { PageLayoutModule } from '~/components/page-layout';
import { SidenavInfoService } from '~/components/sidenav-info';
import { createDomainObjectColumn } from '~/utils';

import {
    TERMINAL_FEES_COLUMNS,
    TerminalChild,
    getTerminalTreeDataItem,
} from './utils/terminal-fees-columns';

@Component({
    selector: 'cc-terminals-terms',
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ListFieldModule,
    ],
    templateUrl: './terminals-terms.component.html',
})
export class TerminalsTermsComponent {
    private sidenavInfoService = inject(SidenavInfoService);
    private repositoryService = inject(ThriftRepositoryService);

    terminalTerms = pagedObservableResource<VersionedObject, void>({
        params: null,
        loader: (_, { continuationToken, size }) =>
            this.repositoryService
                .SearchFullObjects({
                    query: '*',
                    type: DomainObjectType.terminal,
                    continuation_token: continuationToken,
                    limit: size,
                })
                .pipe(
                    map((result) => ({
                        result: result.result,
                        continuationToken: result.continuation_token,
                    })),
                ),
    });

    terms$ = this.terminalTerms.result$.pipe(
        cachedHeadMap(getTerminalTreeDataItem((d) => d.object.terminal.data.terms)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns: Column<VersionedObject, TerminalChild>[] = [
        createDomainObjectColumn((d) => ({ ref: { terminal: d.object.terminal.ref } }), {
            header: 'Terminal',
            sticky: 'start',
        }),
        createDomainObjectColumn(
            (d) => ({ ref: { provider: d.object.terminal.data.provider_ref } }),
            {
                header: 'Provider',
            },
        ),
        ...TERMINAL_FEES_COLUMNS,
        // {
        //     field: 'term_set_history',
        //     cell: (d) => ({
        //         value: d.term_set_history?.length || '',
        //         click: () =>
        //             this.sidenavInfoService.open(TerminalsTermSetHistoryCardComponent, { data: d }),
        //     }),
        // },
    ];
}
