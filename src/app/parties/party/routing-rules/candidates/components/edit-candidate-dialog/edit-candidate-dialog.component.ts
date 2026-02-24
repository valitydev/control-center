import { round } from 'lodash-es';
import { distinctUntilChanged, map, shareReplay } from 'rxjs';

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

@Component({
    selector: 'cc-edit-candidate-dialog',
    templateUrl: 'edit-candidate-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, DialogModule, ReactiveFormsModule, MatButtonModule, InputFieldModule],
})
export class EditCandidateDialogComponent
    extends DialogSuperclass<
        EditCandidateDialogComponent,
        { candidate: RoutingCandidate; othersWeight: number },
        RoutingCandidate
    >
    implements OnInit
{
    private fb = inject(FormBuilder);
    private dr = inject(DestroyRef);

    form = this.fb.nonNullable.group({
        description: this.dialogData.candidate.description,
        weight: this.dialogData.candidate.weight,
        weightPercent: this.calcPercent(this.dialogData.candidate.weight),
    });
    percent$ = getValueChanges(this.form.controls.weight).pipe(
        distinctUntilChanged(),
        map((weight) => this.calcPercent(Number(weight || 0))),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    weight$ = getValueChanges(this.form.controls.weightPercent).pipe(
        distinctUntilChanged(),
        map((weightPercent) => this.calcWeight(Number(weightPercent || 0))),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    ngOnInit() {
        this.weight$.pipe(takeUntilDestroyed(this.dr)).subscribe((weight) => {
            this.form.controls.weight.setValue(Math.round(weight), {
                emitEvent: false,
            });
        });
        this.percent$.pipe(takeUntilDestroyed(this.dr)).subscribe((weightPercent) => {
            this.form.controls.weightPercent.setValue(weightPercent, {
                emitEvent: false,
            });
        });
    }

    confirm() {
        const value = getValue(this.form);
        this.closeWithSuccess({ ...this.dialogData.candidate, ...value });
    }

    private calcPercent(weight: number): number {
        const res = this.dialogData.othersWeight
            ? (weight / (this.dialogData.othersWeight + weight)) * 100
            : 100;
        return round(Math.max(Math.min(res, 100), 0), 2);
    }

    private calcWeight(weightPercent: number): number {
        const res = this.dialogData.othersWeight
            ? (weightPercent * this.dialogData.othersWeight) / (100 - weightPercent)
            : weightPercent
              ? 1
              : 0;
        return round(Math.max(Math.min(res, 1_000_000), 0), 2);
    }
}
