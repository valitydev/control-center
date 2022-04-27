import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { from } from 'rxjs';

@Component({
    selector: 'cc-add-modification-dialog',
    templateUrl: './add-modification-dialog.component.html',
})
export class AddModificationDialogComponent {
    form = this.fb.group({});
    metadata$ = from(import('@vality/domain-proto/lib/metadata.json').then((m) => m.default));

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<AddModificationDialogComponent>
    ) {}

    add() {
        this.dialogRef.close();
    }

    cancel() {
        this.dialogRef.close();
    }
}
