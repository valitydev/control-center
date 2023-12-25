import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { StatDeposit } from '@vality/fistful-proto/fistful_stat';
import { DialogSuperclass } from '@vality/ng-core';

import { CreateDepositService } from './services/create-deposit/create-deposit.service';

@UntilDestroy()
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
        this.error$.pipe(untilDestroyed(this)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit create', 'OK');
            this.closeWithError();
            this.form.enable();
        });
        this.pollingError$.pipe(untilDestroyed(this)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit polling', 'OK');
            this.closeWithError();
            this.form.enable();
        });
        this.pollingTimeout$.pipe(untilDestroyed(this)).subscribe(() => {
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
