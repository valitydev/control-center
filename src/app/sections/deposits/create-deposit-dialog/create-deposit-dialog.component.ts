import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';
import { first } from 'rxjs/operators';

import { ConfigService } from '../../../core/config.service';
import { FetchSourcesService } from '../../sources';
import { CreateDepositService } from './services/create-deposit/create-deposit.service';

@UntilDestroy()
@Component({
    templateUrl: 'create-deposit-dialog.component.html',
    styleUrls: ['create-deposit-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CreateDepositService],
})
export class CreateDepositDialogComponent implements OnInit {
    form: UntypedFormGroup;

    sources$ = this.fetchSourcesService.sources$;

    depositCreated$ = this.createDepositService.depositCreated$;
    isLoading$ = this.createDepositService.isLoading$;
    error$ = this.createDepositService.error$;
    pollingError$ = this.createDepositService.pollingError$;
    pollingTimeout$ = this.createDepositService.pollingTimeout$;

    constructor(
        private createDepositService: CreateDepositService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<CreateDepositDialogComponent>,
        private configService: ConfigService,
        private fetchSourcesService: FetchSourcesService
    ) {}

    ngOnInit() {
        this.form = this.createDepositService.form;
        this.dialogRef
            .afterClosed()
            .pipe(
                switchMap(() => this.sources$.pipe(first())),
                untilDestroyed(this)
            )
            .subscribe((sources) => this.form.reset({ currency: sources[0] }));
        this.depositCreated$.subscribe((deposit) => {
            this.snackBar.open(`Deposit status successfully created`, 'OK', { duration: 3000 });
            this.dialogRef.close(deposit);
            this.form.enable();
        });
        this.error$.pipe(untilDestroyed(this)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit create', 'OK');
            this.dialogRef.close();
            this.form.enable();
        });
        this.pollingError$.pipe(untilDestroyed(this)).subscribe(() => {
            this.snackBar.open('An error occurred while deposit polling', 'OK');
            this.dialogRef.close();
            this.form.enable();
        });
        this.pollingTimeout$.pipe(untilDestroyed(this)).subscribe(() => {
            this.snackBar.open('Polling timeout error', 'OK');
            this.dialogRef.close();
            this.form.enable();
        });
    }

    createDeposit() {
        this.form.disable();
        this.createDepositService.createDeposit();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
