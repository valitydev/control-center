import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Machine, Namespace, ProviderID, RepairStatus } from '@vality/repairer-proto';
import isEmpty from 'lodash-es/isEmpty';
import isNil from 'lodash-es/isNil';
import omitBy from 'lodash-es/omitBy';
import { Moment } from 'moment';
import { filter, map, switchMap } from 'rxjs/operators';

import { BaseDialogResponseStatus } from '../../../components/base-dialog';
import { BaseDialogService } from '../../../components/base-dialog/services/base-dialog.service';
import { ConfirmActionDialogComponent } from '../../../components/confirm-action-dialog';
import { getEnumKeys } from '../../../utils';
import { RepairManagementService } from '../../api/repairer';
import { QueryParamsService } from '../../shared/services';
import { ErrorService } from '../../shared/services/error';
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
    });
    selection: SelectionModel<Machine>;
    displayedColumns = ['_select', 'id', 'namespace', 'createdAt', 'provider', 'status', 'history'];
    statusNameByValue = Object.fromEntries(Object.entries(RepairStatus).map(([k, v]) => [v, k]));
    status = RepairStatus;
    statuses = getEnumKeys(RepairStatus);

    constructor(
        private machinesService: MachinesService,
        private fb: FormBuilder,
        private qp: QueryParamsService<Filters>,
        private baseDialogService: BaseDialogService,
        private repairManagementService: RepairManagementService,
        private notificationService: NotificationService,
        private errorService: ErrorService
    ) {}

    ngOnInit() {
        this.filters.valueChanges
            .pipe(
                map(() => {
                    return omitBy(this.filters.value, isEmpty);
                }),
                untilDestroyed(this)
            )
            .subscribe((v: Filters) => this.qp.set(v));
        this.qp.params$
            .pipe(
                map(({ ids, ns, timespan: d, provider_id, status, error_message }) => {
                    const timespan = omitBy(
                        {
                            from_time: d?.start?.toISOString(),
                            to_time: d?.end?.toISOString(),
                        },
                        isNil
                    );
                    return omitBy(
                        {
                            ids: ids?.split(/[,.;\s]/)?.filter(Boolean),
                            ns,
                            provider_id,
                            status,
                            error_message,
                            timespan: Object.keys(timespan).length ? timespan : null,
                        },
                        isEmpty
                    );
                }),
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
            .open(RepairByScenarioDialogComponent)
            .afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe();
    }
}
