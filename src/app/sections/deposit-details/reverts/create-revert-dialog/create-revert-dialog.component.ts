import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

import { CreateRevertService } from './services/create-revert/create-revert.service';
import { CreateRevertDialogConfig } from './types/create-revert-dialog-config';

@Component({
    templateUrl: 'create-revert-dialog.component.html',
    styleUrls: ['create-revert-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CreateRevertService],
})
export class CreateRevertDialogComponent implements OnInit {
    form: UntypedFormGroup;

    revertCreated$ = this.createRevertService.revertCreated$;
    isLoading$ = this.createRevertService.isLoading$;
    error$ = this.createRevertService.error$;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: CreateRevertDialogConfig,
        private createRevertService: CreateRevertService,
        private snackBar: MatSnackBar,
        private dialogRef: MatDialogRef<CreateRevertDialogComponent>
    ) {}

    ngOnInit() {
        this.createRevertService.init(this.data);
        this.form = this.createRevertService.form;
        this.dialogRef.afterClosed().subscribe(() => this.form.reset());
        this.revertCreated$.subscribe((revert) => {
            this.snackBar.open(`Revert successfully created`, 'OK', { duration: 3000 });
            this.dialogRef.close(revert);
            this.form.enable();
        });
        this.error$.subscribe(() => {
            this.snackBar.open('An error occurred while revert create', 'OK');
            this.dialogRef.close();
            this.form.enable();
        });
    }

    createRevert() {
        this.form.disable();
        this.createRevertService.createRevert();
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
