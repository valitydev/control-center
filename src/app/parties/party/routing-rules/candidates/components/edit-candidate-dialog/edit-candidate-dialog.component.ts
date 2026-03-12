import { map, shareReplay } from 'rxjs';

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { RoutingCandidate } from '@vality/domain-proto/domain';
import {
    DialogModule,
    DialogSuperclass,
    InputFieldModule,
    SelectFieldModule,
    getValue,
    getValueChanges,
} from '@vality/matez';

import {
    DomainObjectFieldComponent,
    DomainThriftFormComponent,
} from '~/components/thrift-api-crud';

const MAX_PERCENT_WEIGHT = 100;

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
        SelectFieldModule,
        DomainObjectFieldComponent,
        DomainThriftFormComponent,
    ],
})
export class EditCandidateDialogComponent extends DialogSuperclass<
    EditCandidateDialogComponent,
    { candidate: RoutingCandidate; others: RoutingCandidate[] },
    { candidate: RoutingCandidate; others: RoutingCandidate[] }
> {
    private fb = inject(FormBuilder);
    private othersWeight = this.dialogData.others.reduce((acc, c) => acc + (c.weight || 0), 0);

    form = this.fb.nonNullable.group({
        terminal: this.dialogData.candidate.terminal.id,
        description: this.dialogData.candidate.description,
        weight: this.dialogData.candidate.weight,
        allowed: this.dialogData.candidate.allowed,
    });
    weightTypeControl = this.fb.nonNullable.control('weight_percent');
    weightOptions = [
        { label: 'Weight', value: 'weight' },
        { label: 'Percent', value: 'weight_percent' },
    ];

    weightsPreview$ = getValueChanges(this.form).pipe(
        map(() => [
            {
                description: 'Current',
                percent: this.normalizeWeight(),
            },
            ...this.getNewOthers().map((c) => ({
                description: c.terminal.id,
                percent: c.weight,
            })),
        ]),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    confirm() {
        const { terminal, weight, ...value } = getValue(this.form);
        const weightNum = this.normalizeWeight(weight);

        this.closeWithSuccess({
            candidate: {
                ...this.dialogData.candidate,
                ...value,
                terminal: { id: terminal },
                weight: weightNum,
            },
            others: this.getNewOthers(),
        });
    }

    private getNewOthers(): RoutingCandidate[] {
        if (this.weightTypeControl.value === 'weight') {
            return this.dialogData.others;
        }

        const weight = this.normalizeWeight();
        const othersWeight = Math.min(this.othersWeight - weight, 0);
        const othersCount = this.dialogData.others.length;
        const availableWeight = MAX_PERCENT_WEIGHT - weight;

        if (othersWeight === 0) {
            return this.dialogData.others.map((c) => ({
                ...c,
                weight: Math.round(availableWeight / othersCount),
            }));
        }

        return this.dialogData.others.map((c) => ({
            ...c,
            weight: Math.round((c.weight / othersWeight) * availableWeight),
        }));
    }

    private normalizeWeight(weight: unknown = this.form.value.weight): number {
        return Math.max(Math.min(Number(weight || '0'), 100), 0);
    }
}
