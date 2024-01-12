import { ChangeDetectionStrategy, Component, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { DialogSuperclass } from '@vality/ng-core';

import { CreateDepositService } from './services/create-deposit/create-deposit.service';

@Component({
    templateUrl: 'create-deposit-dialog.component.html',
    styleUrls: ['create-deposit-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CreateDepositService],
})
export class CreateDepositDialogComponent
    extends DialogSuperclass<CreateDepositDialogComponent, void, StatDeposit>
    implements OnInit
{
    form: UntypedFormGroup;
    depositCreated$ = this.createDepositService.depositCreated$;
    isLoading$ = this.createDepositService.isLoading$;
    error$ = this.createDepositService.error$;
    pollingError$ = this.createDepositService.pollingError$;
    pollingTimeout$ = this.createDepositService.pollingTimeout$;

    constructor(
        private createDepositService: CreateDepositService,
        private snackBar: MatSnackBar,
        private destroyRef: DestroyRef,
    ) {
        super();
    }

    ngOnInit() {
        this.form = this.createDepositService.form;
        this.depositCreated$.subscribe((deposit) => {
            this.snackBar.open(`Deposit status successfully created`, 'OK', { duration: 3000 });
            this.closeWithSuccess(deposit);
            this.form.enable();
        });
        this.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit create', 'OK');
            this.closeWithError();
            this.form.enable();
        });
        this.pollingError$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit polling', 'OK');
            this.closeWithError();
            this.form.enable();
        });
        this.pollingTimeout$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.snackBar.open('Polling timeout error', 'OK');
            this.closeWithError();
            this.form.enable();
        });
    }

    createDeposit() {
        this.form.disable();
        this.createDepositService.createDeposit();
    }
}
