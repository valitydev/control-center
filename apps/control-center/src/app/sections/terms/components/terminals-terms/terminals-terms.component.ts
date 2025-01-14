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
    Column,
    FiltersModule,
    InputFieldModule,
    ListFieldModule,
    LoadOptions,
    QueryParamsService,
    TableModule,
    UpdateOptions,
    VSelectPipe,
    cachedHeadMap,
    clean,
    countChanged,
    createControls,
    debounceTimeWithFirst,
    getValueChanges,
} from '@vality/matez';
import { map, shareReplay } from 'rxjs/operators';
import { Overwrite } from 'utility-types';

import type { ProviderRef, TerminalRef } from '@vality/dominator-proto/internal/proto/domain';

import { PageLayoutModule, createDomainObjectColumn } from '../../../../shared';
import { CurrencyFieldComponent } from '../../../../shared/components/currency-field/currency-field.component';
import { MerchantFieldModule } from '../../../../shared/components/merchant-field/merchant-field.module';
import { SidenavInfoService } from '../../../../shared/components/sidenav-info';
import { DEBOUNCE_TIME_MS } from '../../../../tokens';
import { TerminalsTermSetHistoryCardComponent } from '../terminals-term-set-history-card';

import { TerminalsTermsService } from './terminals-terms.service';
import { TERMINAL_FEES_COLUMNS, getTerminalTreeDataItem } from './utils/terminal-fees-columns';

type Params = Pick<CommonSearchQueryParams, 'currencies'> &
    Overwrite<
        Omit<TerminalSearchQuery, 'common_search_query_params'>,
        { provider_ids?: ProviderRef['id'][]; terminal_ids?: TerminalRef['id'][] }
    >;

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
    terms$ = this.terminalsTermsService.result$.pipe(
        cachedHeadMap(getTerminalTreeDataItem((d) => d.current_term_set)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    hasMore$ = this.terminalsTermsService.hasMore$;
    isLoading$ = this.terminalsTermsService.isLoading$;
    columns: Column<TerminalTermSet>[] = [
        createDomainObjectColumn((d) => ({ ref: { terminal: d.terminal_id } }), {
            header: 'Terminal',
            sticky: 'start',
        }),
        createDomainObjectColumn((d) => ({ ref: { provider: d.provider_id } }), {
            header: 'Provider',
        }),
        { field: 'currencies', cell: (d) => ({ value: d.currencies.join(', ') }) },
        ...TERMINAL_FEES_COLUMNS,
        {
            field: 'term_set_history',
            cell: (d) => ({
                value: d.term_set_history?.length || '',
                click: () =>
                    this.sidenavInfoService.open(TerminalsTermSetHistoryCardComponent, { data: d }),
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
