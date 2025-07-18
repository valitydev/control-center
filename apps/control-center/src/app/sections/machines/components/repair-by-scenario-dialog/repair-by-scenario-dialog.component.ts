import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import {
    DialogResponseStatus,
    DialogSuperclass,
    NotifyLogService,
    getValue,
    progressTo,
} from '@vality/matez';
import { metadata$ } from '@vality/repairer-proto';
import {
    Machine,
    RepairInvoicesRequest,
    RepairManagement,
    RepairWithdrawalsRequest,
} from '@vality/repairer-proto/repairer';
import isNil from 'lodash-es/isNil';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { DomainMetadataFormExtensionsService } from '../../../../shared/services';

enum Types {
    Same,
    Different,
}

enum Namespace {
    Invoice,
    Withdrawal,
}

@Component({
    templateUrl: './repair-by-scenario-dialog.component.html',
    standalone: false,
})
export class RepairByScenarioDialogComponent
    extends DialogSuperclass<RepairByScenarioDialogComponent, { machines: Machine[] }>
    implements OnInit
{
    private repairManagementService = inject(RepairManagement);
    private log = inject(NotifyLogService);
    private domainMetadataFormExtensionsService = inject(DomainMetadataFormExtensionsService);
    private destroyRef = inject(DestroyRef);
    nsControl = new FormControl<Namespace>(null, Validators.required);
    typeControl = new FormControl<Types>(Types.Same, Validators.required);
    form = new FormControl<RepairInvoicesRequest | RepairWithdrawalsRequest>(
        [],
        Validators.required,
    );
    sameForm = new FormControl<RepairInvoicesRequest | RepairWithdrawalsRequest>(
        null,
        Validators.required,
    );
    metadata$ = metadata$;
    extensions$ = this.domainMetadataFormExtensionsService.extensions$;
    progress$ = new BehaviorSubject(0);

    typesEnum = Types;
    nsEnum = Namespace;

    get hasNs() {
        return !isNil(this.nsControl.value);
    }

    ngOnInit() {
        this.nsControl.valueChanges
            .pipe(
                map(() => getValue(this.nsControl)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(() => {
                this.form.setValue(
                    this.dialogData.machines.map(({ id }) => ({ id, scenario: {} })),
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
            .pipe(progressTo(this.progress$), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.log.success();
                    this.dialogRef.close({ status: DialogResponseStatus.Success });
                },
                error: this.log.error,
            });
    }
}
