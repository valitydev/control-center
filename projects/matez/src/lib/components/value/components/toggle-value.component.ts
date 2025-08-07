import { Component, input } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TypedParamsValue } from '../types/base-type';

export type ToggleValue = TypedParamsValue<'toggle'>;

@Component({
    selector: 'v-toggle-value',
    imports: [MatSlideToggleModule],
    template: ` @if (value(); as v) {
        <mat-slide-toggle
            [checked]="value().value"
            (change)="$event.source.checked = !!value().value"
        >
        </mat-slide-toggle>
    }`,
})
export class ToggleValueComponent {
    value = input.required<ToggleValue>();
}
