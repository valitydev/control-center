import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';
import { getEnumKey } from '@cc/utils';

import { RepairManagementService } from '../../api/repairer';
import { NotificationService } from '../../shared/services/notification';

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

@UntilDestroy()
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
        { field: 'id', pinned: 'left' },
        { header: 'Namespace', field: 'ns' },
        { field: 'created_at', type: 'datetime' },
        {
            field: 'provider',
            formatter: (data) =>
                this.domainStoreService
                    .getObjects('provider')
                    .pipe(
                        map(
                            (providers) =>
                                providers.find((p) => String(p.ref.id) === data.provider_id)?.data
                                    ?.name,
                        ),
                    ),
            description: 'provider_id',
        },
        {
            field: 'status',
            formatter: (data) => getEnumKey(repairer.RepairStatus, data.status),
            tooltip: 'error_message',
        },
        {
            field: 'history',
            formatter: (data) => (data.history?.length ? String(data.history.length) : ''),
            tooltip: 'history',
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
        private domainStoreService: DomainStoreService,
    ) {}

    ngOnInit() {
        this.filters.patchValue(this.qp.params);
        this.filters.valueChanges
            .pipe(
                map(() => clean(this.filters.value)),
                untilDestroyed(this),
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
                untilDestroyed(this),
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
                untilDestroyed(this),
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
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
