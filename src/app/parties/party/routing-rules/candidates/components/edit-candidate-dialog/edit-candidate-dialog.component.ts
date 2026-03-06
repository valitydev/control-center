import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { RoutingCandidate } from '@vality/domain-proto/domain';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    getValue,
    getValueChanges,
} from '@vality/matez';

import {
    DomainObjectFieldComponent,
    DomainThriftFormComponent,
} from '~/components/thrift-api-crud';

@Component({
    selector: 'cc-edit-candidate-dialog',
    templateUrl: 'edit-candidate-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DialogModule,
        ReactiveFormsModule,
        MatButtonModule,
        InputFieldModule,
        DomainObjectFieldComponent,
        DomainThriftFormComponent,
    ],
})
export class EditCandidateDialogComponent
    extends DialogSuperclass<
        EditCandidateDialogComponent,
        { candidate: RoutingCandidate; others: RoutingCandidate[] },
        { candidate: RoutingCandidate; others: RoutingCandidate[] }
    >
    implements OnInit
{
    private fb = inject(FormBuilder);
    private dr = inject(DestroyRef);
    private othersWeight = this.dialogData.others.reduce((acc, c) => acc + (c.weight || 0), 0);

    form = this.fb.nonNullable.group({
        terminal: this.dialogData.candidate.terminal.id,
        description: this.dialogData.candidate.description,
        weight: this.dialogData.candidate.weight,
        allowed: this.dialogData.candidate.allowed,
    });
    weightPercentControl = this.fb.nonNullable.control<number | null>(null);

    ngOnInit() {
        getValueChanges(this.weightPercentControl)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.form.controls.weight.setValue(null, {
                    emitEvent: false,
                });
            });
        getValueChanges(this.form.controls.weight)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe(() => {
                this.weightPercentControl.setValue(null, {
                    emitEvent: false,
                });
            });
    }

    confirm() {
        const { terminal, weight, ...value } = getValue(this.form);
        const percent = getValue(this.weightPercentControl);
        const isPercent = !!percent;
        const weightNum = isPercent ? Number(percent) : Number(weight || 0);

        this.closeWithSuccess({
            candidate: {
                ...this.dialogData.candidate,
                terminal: { id: terminal },
                ...value,
                weight: weightNum,
            },
            others: isPercent
                ? this.dialogData.others.map((c) => ({
                      ...c,
                      weight:
                          c.weight && this.othersWeight
                              ? Math.round(
                                    (c.weight / this.othersWeight) *
                                        (this.othersWeight -
                                            (weight || 0) +
                                            (percent
                                                ? Math.round((percent / 100) * this.othersWeight)
                                                : 0)),
                                )
                              : 0,
                  }))
                : this.dialogData.others,
        });
    }
}
