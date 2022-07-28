import { Component, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormControl } from '@ngneat/reactive-forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogResponseStatus, BaseDialogSuperclass } from '@vality/ng-core';
import { RepairInvoicesRequest, RepairWithdrawalsRequest } from '@vality/repairer-proto';
import { BehaviorSubject, from } from 'rxjs';

import { progressTo } from '../../../../../utils';
import { RepairManagementService } from '../../../../api/repairer';
import { ErrorService } from '../../../../shared/services/error';
import { NotificationService } from '../../../../shared/services/notification';

enum Types {
    Invoices,
    Withdrawals,
}

@UntilDestroy()
@Component({
    templateUrl: './repair-by-scenario-dialog.component.html',
})
export class RepairByScenarioDialogComponent extends BaseDialogSuperclass<RepairByScenarioDialogComponent> {
    typeControl = new FormControl<number>(null, Validators.required);
    form = new FormControl<RepairInvoicesRequest | RepairWithdrawalsRequest>(
        null,
        Validators.required
    );
    metadata$ = from(import('@vality/repairer-proto/lib/metadata.json').then((m) => m.default));
    progress$ = new BehaviorSubject(0);
    typesEnum = Types;

    constructor(
        injector: Injector,
        private repairManagementService: RepairManagementService,
        private errorService: ErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    repair() {
        (this.typeControl.value === Types.Invoices
            ? this.repairManagementService.RepairInvoices(this.form.value as RepairInvoicesRequest)
            : this.repairManagementService.RepairWithdrawals(
                  this.form.value as RepairWithdrawalsRequest
              )
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
