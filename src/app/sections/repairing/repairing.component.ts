import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogResponseStatus, BaseDialogService, clean, splitIds } from '@vality/ng-core';
import { repairer } from '@vality/repairer-proto';
import { Namespace, ProviderID, RepairStatus, Machine } from '@vality/repairer-proto/repairer';
import isNil from 'lodash-es/isNil';
import { Moment } from 'moment';
import { filter, map, switchMap } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import { NotificationErrorService } from '@cc/app/shared/services/notification-error';
import { Schema } from '@cc/components/simple-table';
import { getEnumKey } from '@cc/utils';

import { ConfirmActionDialogComponent } from '../../../components/confirm-action-dialog';
import { Columns, SELECT_COLUMN_NAME } from '../../../components/table';
import { RepairManagementService } from '../../api/repairer';
import { QueryParamsService } from '../../shared/services';
import { NotificationService } from '../../shared/services/notification';
import { RepairByScenarioDialogComponent } from './components/repair-by-scenario-dialog/repair-by-scenario-dialog.component';
import { MachinesService } from './services/machines.service';

interface Filters {
    ids: string;
    ns: Namespace;
    timespan: DateRange<Moment>;
    provider_id: ProviderID;
    status: RepairStatus;
    error_message: string;
}

@UntilDestroy()
@Component({
    selector: 'cc-repairing',
    templateUrl: './repairing.component.html',
    styles: [
        `
            :host {
                display: block;
                padding: 24px 16px;
            }
        `,
    ],
    providers: [MachinesService],
})
export class RepairingComponent implements OnInit {
    machines$ = this.machinesService.searchResult$;
    inProgress$ = this.machinesService.doAction$;
    hasMore$ = this.machinesService.hasMore$;
    filters = this.fb.group<Filters>({
        ids: null,
        ns: null,
        timespan: null,
        provider_id: null,
        status: null,
        error_message: null,
        ...this.qp.params,
    });
    selection: SelectionModel<Machine>;
    cols = new Columns(
        SELECT_COLUMN_NAME,
        'id',
        'namespace',
        'createdAt',
        'provider',
        'status',
        'history'
    );
    status = repairer.RepairStatus;
    schema = new Schema<Machine>([
        'id',
        { label: 'Namespace', value: 'ns' },
        { value: 'created_at', type: 'datetime' },
        {
            label: 'Provider',
            value: (v) =>
                this.domainStoreService
                    .getObjects('provider')
                    .pipe(
                        map(
                            (providers) =>
                                providers.find((p) => String(p.ref.id) === v.provider_id)?.data
                                    ?.name
                        )
                    ),
            description: 'provider_id',
        },
        {
            label: 'Status',
            value: (v) => getEnumKey(repairer.RepairStatus, v.status),
            tooltip: (v) => v.error_message,
        },
        {
            label: 'History',
            value: (v) => (v.history?.length ? String(v.history.length) : ''),
            tooltip: (v) => v.history,
        },
    ]);

    constructor(
        private machinesService: MachinesService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Filters>,
        private baseDialogService: BaseDialogService,
        private repairManagementService: RepairManagementService,
        private notificationService: NotificationService,
        private notificationErrorService: NotificationErrorService,
        private domainStoreService: DomainStoreService
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                map(() => clean(this.filters.value)),
                untilDestroyed(this)
            )
            .subscribe((v: Filters) => this.qp.set(v));
        this.qp.params$
            .pipe(
                map(({ ids, ns, timespan, provider_id, status, error_message }) =>
                    clean({
                        ids: splitIds(ids),
                        ns,
                        provider_id: isNil(provider_id) ? null : String(provider_id),
                        status,
                        error_message,
                        timespan:
                            timespan?.start && timespan?.end
                                ? {
                                      from_time: timespan?.start?.toISOString(),
                                      to_time: timespan?.end?.toISOString(),
                                  }
                                : null,
                    })
                ),
                untilDestroyed(this)
            )
            .subscribe((params) => this.machinesService.search(params));
    }

    update(size: number) {
        this.machinesService.refresh(size);
    }

    fetchMore() {
        this.machinesService.fetchMore();
    }

    repair() {
        this.baseDialogService
            .open(ConfirmActionDialogComponent, {
                title: `Simple repair ${this.selection.selected.length} machines`,
            })
            .afterClosed()
            .pipe(
                filter(({ status }) => status === BaseDialogResponseStatus.Success),
                switchMap(() =>
                    this.repairManagementService.SimpleRepairAll(
                        this.selection.selected.map(({ id, ns }) => ({ id, ns }))
                    )
                ),
                untilDestroyed(this)
            )
            .subscribe({
                next: () => {
                    this.notificationService.success();
                },
                error: this.notificationErrorService.error,
            });
    }

    repairByScenario() {
        this.baseDialogService
            .open(RepairByScenarioDialogComponent, { machines: this.selection.selected })
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
