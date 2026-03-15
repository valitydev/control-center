import { combineLatest, map, shareReplay } from 'rxjs';

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
    getValueChanges,
} from '@vality/matez';

import {
    DomainObjectFieldComponent,
    DomainThriftFormComponent,
} from '~/components/thrift-api-crud';

const MAX_PERCENT_WEIGHT = 100;

interface CandidateWithIdx {
    candidate: RoutingCandidate;
    idx: number;
}

function normalizePercent(weight: unknown = 0): number {
    const parsed = Number(weight);
    return Math.max(Math.min(Math.round(isNaN(parsed) ? 0 : parsed), 100), 0);
}

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
    { candidates: CandidateWithIdx[]; idx: number },
    { candidates: CandidateWithIdx[]; idx: number }
> {
    private fb = inject(FormBuilder);
    private currentCandidate = this.dialogData.candidates.find((c) => c.idx === this.dialogData.idx)
        .candidate;
    private otherCandidates = this.dialogData.candidates.filter(
        (c) => c.idx !== this.dialogData.idx,
    );
    private othersWeight = this.otherCandidates.reduce((acc, c) => acc + c.candidate.weight, 0);

    form = this.fb.nonNullable.group({
        terminal: this.currentCandidate.terminal.id,
        description: this.currentCandidate.description,
        weight: this.getPercentWeight(this.currentCandidate.weight),
        allowed: this.currentCandidate.allowed,
    });
    weightTypeControl = this.fb.nonNullable.control('weight_percent');
    weightOptions = [
        { label: 'Weight', value: 'weight' },
        { label: 'Percent', value: 'weight_percent' },
    ];

    weightsPreview$ = combineLatest([
        getValueChanges(this.weightTypeControl),
        getValueChanges(this.form),
    ]).pipe(
        map(([weightType]) => {
            const newCandidates = this.getNewCandidates().sort((a, b) =>
                a.idx === this.dialogData.idx
                    ? -1
                    : b.idx === this.dialogData.idx
                      ? 1
                      : b.candidate.weight - a.candidate.weight,
            );
            return newCandidates.map((c) => {
                if (weightType === 'weight_percent')
                    return {
                        description: c.candidate.terminal.id,
                        percent: c.candidate.weight + '%',
                    };
                const allWeight = newCandidates.reduce((acc, c) => acc + c.candidate.weight, 0);
                return {
                    description: c.candidate.terminal.id,
                    percent:
                        normalizePercent((c.candidate.weight / allWeight) * 100) +
                        `% (${c.candidate.weight})`,
                };
            });
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    confirm() {
        this.closeWithSuccess({
            ...this.dialogData,
            candidates: this.getNewCandidates(),
        });
    }

    private getNewCandidates(): CandidateWithIdx[] {
        if (this.weightTypeControl.value === 'weight') {
            const weight = Number(this.form.value.weight) || 0;
            return this.dialogData.candidates.map((c) => ({
                ...c,
                candidate: {
                    ...c.candidate,
                    weight: c.idx === this.dialogData.idx ? weight : c.candidate.weight,
                },
            }));
        }
        const percentWeight = normalizePercent(this.form.value.weight);
        const availableWeight = MAX_PERCENT_WEIGHT - percentWeight;

        return this.dialogData.candidates.map((c) => ({
            ...c,
            candidate: {
                ...c.candidate,
                weight:
                    c.idx === this.dialogData.idx
                        ? percentWeight
                        : normalizePercent(
                              this.othersWeight === 0
                                  ? normalizePercent(availableWeight / this.otherCandidates.length)
                                  : (c.candidate.weight / this.othersWeight) * availableWeight,
                          ),
            },
        }));
    }

    private getPercentWeight(
        weight: number = 0,
        othersWeight: number = this.othersWeight || 0,
        count: number = this.otherCandidates.length + 1,
    ): number {
        if (othersWeight === 0) {
            if (weight === 0) return normalizePercent(MAX_PERCENT_WEIGHT / count);
            return 100;
        }
        if (weight === 0) return 0;
        const allWeight = weight + othersWeight;
        return normalizePercent((weight / allWeight) * MAX_PERCENT_WEIGHT);
    }
}
