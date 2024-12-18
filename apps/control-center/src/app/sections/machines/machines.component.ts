import { Component, OnInit, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import {
    DialogResponseStatus,
    DialogService,
    clean,
    ConfirmDialogComponent,
    QueryParamsService,
    NotifyLogService,
    DateRange,
    getNoTimeZoneIsoString,
    createDateRangeToToday,
    isEqualDateRange,
    getValueChanges,
    countChanged,
    debounceTimeWithFirst,
    FetchOptions,
    getEnumKey,
    Column,
} from '@vality/ng-core';
import { repairer } from '@vality/repairer-proto';
import { Namespace, ProviderID, RepairStatus, Machine } from '@vality/repairer-proto/repairer';
import { endOfDay } from 'date-fns';
import isNil from 'lodash-es/isNil';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, map, shareReplay } from 'rxjs/operators';

import { createDomainObjectColumn } from '@cc/app/shared';
import { SidenavInfoService } from '@cc/app/shared/components/sidenav-info';

import { RepairManagementService } from '../../api/repairer';
import { DATE_RANGE_DAYS, DEBOUNCE_TIME_MS } from '../../tokens';

import { MachineStatusHistoryCardComponent } from './components/machine-status-history-card.component';
import { RepairByScenarioDialogComponent } from './components/repair-by-scenario-dialog/repair-by-scenario-dialog.component';
import { MachinesService } from './services/machines.service';

interface Filters {
    ids: string[];
    ns: Namespace;
    timespan: DateRange;
    provider_id: ProviderID;
    status: RepairStatus;
    error_message: string;
}

@Component({
    selector: 'cc-machines',
    templateUrl: './machines.component.html',
    providers: [MachinesService],
})
export class MachinesComponent implements OnInit {
    machines$ = this.machinesService.result$;
    inProgress$ = this.machinesService.isLoading$;
    hasMore$ = this.machinesService.hasMore$;
    filtersForm = this.fb.group({
        ids: [null as string[]],
        ns: null as string,
        timespan: createDateRangeToToday(this.dateRangeDays),
        provider_id: null as string,
        status: null as RepairStatus,
        error_message: null as string,
    });
    selected$ = new BehaviorSubject<Machine[]>([]);
    status = repairer.RepairStatus;
    columns: Column<Machine>[] = [
        { field: 'id', sticky: 'start' },
        { header: 'Namespace', field: 'ns' },
        { field: 'created_at', cell: { type: 'datetime' } },
        createDomainObjectColumn((d) => ({ ref: { provider: { id: Number(d.provider_id) } } }), {
            header: 'Provider',
        }),
        {
            field: 'status',
            cell: (d) => ({
                value: startCase(getEnumKey(repairer.RepairStatus, d.status)),
                color: (
                    {
                        failed: 'warn',
                        in_progress: 'pending',
                        repaired: 'success',
                    } as const
                )[getEnumKey(repairer.RepairStatus, d.status)],
            }),
        },
        {
            field: 'history',
            cell: (d) => ({
                value: d.history?.length ? String(d.history.length) : '',
                click: () => {
                    this.sidenavInfoService.toggle(MachineStatusHistoryCardComponent, {
                        history: d.history,
                    });
                },
            }),
        },
        {
            field: 'error_message',
        },
    ];
    active$ = getValueChanges(this.filtersForm).pipe(
        map((v) => countChanged(this.initFilters, v, { timespan: isEqualDateRange })),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    private initFilters = this.filtersForm.value;

    constructor(
        private machinesService: MachinesService,
        private fb: NonNullableFormBuilder,
        private qp: QueryParamsService<Filters>,
        private dialogService: DialogService,
        private repairManagementService: RepairManagementService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
        @Inject(DATE_RANGE_DAYS) private dateRangeDays: number,
        @Inject(DEBOUNCE_TIME_MS) private debounceTimeMs: number,
        private sidenavInfoService: SidenavInfoService,
    ) {}

    ngOnInit() {
        this.filtersForm.patchValue(this.qp.params);
        getValueChanges(this.filtersForm)
            .pipe(debounceTimeWithFirst(this.debounceTimeMs), takeUntilDestroyed(this.destroyRef))
            .subscribe((params: Filters) => {
                const { ids, ns, timespan, provider_id, status, error_message } = params;
                void this.qp.set(clean(params));
                this.machinesService.load(
                    clean({
                        ids,
                        ns,
                        provider_id: isNil(provider_id) ? null : String(provider_id),
                        status,
                        error_message,
                        timespan:
                            timespan?.start && timespan?.end
                                ? {
                                      from_time: getNoTimeZoneIsoString(timespan?.start),
                                      to_time: getNoTimeZoneIsoString(endOfDay(timespan?.end)),
                                  }
                                : null,
                    }),
                );
            });
    }

    reload(options?: FetchOptions) {
        this.machinesService.reload(options);
    }

    more() {
        this.machinesService.more();
    }

    repair() {
        this.dialogService
            .open(ConfirmDialogComponent, {
                title: `Simple repair ${this.selected$.value.length} machines`,
            })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === DialogResponseStatus.Success),
                switchMap(() =>
                    this.repairManagementService.SimpleRepairAll(
                        this.selected$.value.map(({ id, ns }) => ({ id, ns })),
                    ),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: () => {
                    this.log.success();
                },
                error: (err) => this.log.error(err),
            });
    }

    repairByScenario() {
        this.dialogService
            .open(RepairByScenarioDialogComponent, { machines: this.selected$.value })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
    }
}
