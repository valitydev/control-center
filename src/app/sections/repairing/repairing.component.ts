import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogResponseStatus, BaseDialogService, clean } from '@vality/ng-core';
import { Machine, Namespace, ProviderID, RepairStatus } from '@vality/repairer-proto';
import { Moment } from 'moment';
import { filter, map, switchMap } from 'rxjs/operators';

import { NotificationErrorService } from '@cc/app/shared/services/notification-error';

import { splitIds } from '../../../../projects/ng-core/src/lib';
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
    status = RepairStatus;

    constructor(
        private machinesService: MachinesService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Filters>,
        private baseDialogService: BaseDialogService,
        private repairManagementService: RepairManagementService,
        private notificationService: NotificationService,
        private errorService: NotificationErrorService
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
                        provider_id,
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

    update() {
        this.machinesService.refresh();
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
                error: (err) => {
                    this.notificationService.error();
                    this.errorService.error(err);
                },
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
