import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import {
    CommonSearchQueryParams,
    type TerminalSearchQuery,
    type TerminalTermSet,
} from '@vality/dominator-proto/internal/dominator';
import {
    clean,
    Column,
    countChanged,
    createControls,
    debounceTimeWithFirst,
    FiltersModule,
    getValueChanges,
    InputFieldModule,
    ListFieldModule,
    LoadOptions,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    VSelectPipe,
} from '@vality/ng-core';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import type { ProviderRef, TerminalRef } from '@vality/dominator-proto/internal/proto/domain';

import { PageLayoutModule } from '@cc/app/shared';
import { CurrencyFieldComponent } from '@cc/app/shared/components/currency-field';
import { MerchantFieldModule } from '@cc/app/shared/components/merchant-field';
import { createDomainObjectColumn } from '@cc/app/shared/utils/table/create-domain-object-column';
import { DEBOUNCE_TIME_MS } from '@cc/app/tokens';

import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import { TerminalsTermSetHistoryCardComponent } from '../terminals-term-set-history-card';

import { TerminalsTermsService } from './terminals-terms.service';
import { createTerminalFeesColumn } from './utils/create-terminal-fees-column';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<TerminalSearchQuery, 'common_search_query_params'>,
        { provider_ids?: ProviderRef['id'][]; terminal_ids?: TerminalRef['id'][] }
    >;

@Component({
    selector: 'cc-terminals-terms',
    standalone: true,
    imports: [
        CommonModule,
        PageLayoutModule,
        TableModule,
        InputFieldModule,
        FiltersModule,
        ReactiveFormsModule,
        MerchantFieldModule,
        ListFieldModule,
        CurrencyFieldComponent,
        MatTooltip,
        VSelectPipe,
    ],
    templateUrl: './terminals-terms.component.html',
})
export class TerminalsTermsComponent implements OnInit {
    filtersForm = this.fb.group(
        createControls<Params>({
            currencies: null,
            provider_ids: null,
            terminal_ids: null,
        }),
    );
    terms$ = this.terminalsTermsService.result$;
    hasMore$ = this.terminalsTermsService.hasMore$;
    isLoading$ = this.terminalsTermsService.isLoading$;
    columns: Column<TerminalTermSet>[] = [
        createDomainObjectColumn<TerminalTermSet>('terminal', (d) => d.terminal_id),
        createDomainObjectColumn<TerminalTermSet>('provider', (d) => d.provider_id),
        { field: 'currencies', formatter: (d) => d.currencies.join(', ') },
        ...createTerminalFeesColumn<TerminalTermSet>((d) => d.current_term_set),
        {
            field: 'term_set_history',
            formatter: (d) => d.term_set_history?.length || '',
            click: (d) =>
                this.sidenavInfoService.open(TerminalsTermSetHistoryCardComponent, {
                    data: d?.term_set_history?.reverse(),
                }),
        },
    ];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((filters) => countChanged(this.initFiltersValue, filters)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFiltersValue = this.filtersForm.value;

    constructor(
        private terminalsTermsService: TerminalsTermsService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<Params>,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private dr: DestroyRef,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.dr))
            .subscribe((filters) => {
                void this.qp.set(filters);
                this.load(filters);
            });
    }

    load(params: Params, options?: LoadOptions) {
        const { currencies, provider_ids, terminal_ids, ...otherParams } = params;
        this.terminalsTermsService.load(
            clean({
                common_search_query_params: { currencies },
                provider_ids: provider_ids?.map?.((id) => ({ id })),
                terminal_ids: terminal_ids?.map?.((id) => ({ id })),
                ...otherParams,
            }),
            options,
        );
    }

    update(options?: UpdateOptions) {
        this.terminalsTermsService.reload(options);
    }

    more() {
        this.terminalsTermsService.more();
    }
}
