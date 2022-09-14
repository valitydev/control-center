import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@vality/ng-core';
import { RepairInvoicesRequest, RepairWithdrawalsRequest, Machine } from '@vality/repairer-proto';
import { BehaviorSubject, from } from 'rxjs';

import { progressTo, getFormValueChanges } from '../../../../../utils';
import { RepairManagementService } from '../../../../api/repairer';
import { ErrorService } from '../../../../shared/services/error';
import { NotificationService } from '../../../../shared/services/notification';

enum Types {
    Same,
    Different,
}

enum Namespace {
    Invoice,
    Withdrawal,
}

@UntilDestroy()
@Component({
    templateUrl: './repair-by-scenario-dialog.component.html',
})
export class RepairByScenarioDialogComponent
    extends BaseDialogSuperclass<RepairByScenarioDialogComponent, { machines: Machine[] }>
    implements OnInit
{
    nsControl = new FormControl<Namespace>(null, Validators.required);
    typeControl = new FormControl<Types>(Types.Same, Validators.required);
    form = new FormControl<RepairInvoicesRequest | RepairWithdrawalsRequest>(
        [],
        Validators.required
    );
    sameForm = new FormControl<RepairInvoicesRequest | RepairWithdrawalsRequest>(
        null,
        Validators.required
    );
    metadata$ = from(import('@vality/repairer-proto/lib/metadata.json').then((m) => m.default));
    progress$ = new BehaviorSubject(0);

    typesEnum = Types;
    nsEnum = Namespace;

    constructor(
        injector: Injector,
        private repairManagementService: RepairManagementService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    ngOnInit() {
        getFormValueChanges(this.nsControl)
            .pipe(untilDestroyed(this))
            .subscribe(() => {
                this.form.setValue(
                    this.dialogData.machines.map(({ id }) => ({ id, scenario: {} }))
                );
            });
    }

    repair() {
        const value =
            this.typeControl.value === Types.Different
                ? this.form.value
                : this.dialogData.machines.map(({ id }) => ({ id, scenario: this.sameForm.value }));
        (this.nsControl.value === Namespace.Invoice
            ? this.repairManagementService.RepairInvoices(value as RepairInvoicesRequest)
            : this.repairManagementService.RepairWithdrawals(value as RepairWithdrawalsRequest)
        )
            .pipe(progressTo(this.progress$), untilDestroyed(this))
            .subscribe({
                next: () => {
                    this.notificationService.success();
                    this.dialogRef.close({ status: BaseDialogResponseStatus.Success });
                },
                error: (err) => {
                    this.errorService.error(err);
                    this.notificationService.error();
                },
            });
    }
}
