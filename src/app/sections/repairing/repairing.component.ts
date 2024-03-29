import { Component, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import {
    DialogResponseStatus,
    DialogService,
    clean,
    Column,
    ConfirmDialogComponent,
    QueryParamsService,
    NotifyLogService,
    DateRange,
    getNoTimeZoneIsoString,
} from '@vality/ng-core';
import { repairer } from '@vality/repairer-proto';
import { Namespace, ProviderID, RepairStatus, Machine } from '@vality/repairer-proto/repairer';
import { endOfDay } from 'date-fns';
import isNil from 'lodash-es/isNil';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { getEnumKey } from '@cc/utils';

import { RepairManagementService } from '../../api/repairer';
import { NotificationService } from '../../shared/services/notification';
import { createProviderColumn } from '../../shared/utils/table/create-provider-column';

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
    selector: 'cc-repairing',
    templateUrl: './repairing.component.html',
    providers: [MachinesService],
})
export class RepairingComponent implements OnInit {
    machines$ = this.machinesService.searchResult$;
    inProgress$ = this.machinesService.doAction$;
    hasMore$ = this.machinesService.hasMore$;
    filters = this.fb.group({
        ids: [null as string[]],
        ns: null as string,
        timespan: null as DateRange,
        provider_id: null as string,
        status: null as RepairStatus,
        error_message: null as string,
    });
    selected$ = new BehaviorSubject<Machine[]>([]);
    status = repairer.RepairStatus;
    columns: Column<Machine>[] = [
        { field: 'id' },
        { header: 'Namespace', field: 'ns' },
        { field: 'created_at', type: 'datetime' },
        createProviderColumn((d) => Number(d.provider_id)),
        {
            field: 'status',
            formatter: (d) => getEnumKey(repairer.RepairStatus, d.status),
            type: 'tag',
            typeParameters: {
                label: (d) => startCase(getEnumKey(repairer.RepairStatus, d.status)),
                tags: {
                    failed: { color: 'warn' },
                    in_progress: { color: 'pending' },
                    repaired: { color: 'success' },
                },
            },
        },
        {
            field: 'history',
            formatter: (data) => (data.history?.length ? String(data.history.length) : ''),
            tooltip: 'history',
        },
        {
            field: 'error_message',
        },
    ];

    constructor(
        private machinesService: MachinesService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Filters>,
        private dialogService: DialogService,
        private repairManagementService: RepairManagementService,
        private notificationService: NotificationService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit() {
        this.filters.patchValue(this.qp.params);
        this.filters.valueChanges
            .pipe(
                map(() => clean(this.filters.value)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((v: Filters) => this.qp.set(v));
        this.qp.params$
            .pipe(
                map(({ ids, ns, timespan, provider_id, status, error_message }) =>
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
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((params) => this.machinesService.search(params));
    }

    update(size: number) {
        this.machinesService.refresh(size);
        this.selected$.next([]);
    }

    fetchMore() {
        this.machinesService.fetchMore();
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
                    this.notificationService.success();
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
