import { Component, input } from '@angular/core';

import { Value } from '../types/value';
import { ValueComponent } from '../value.component';

@Component({
    selector: 'v-value-list',
    standalone: true,
    imports: [ValueComponent],
    template: `
        @if (list(); as items) {
            @if (items.length > 1) {
                <div class="list">
                    @for (item of items; track item) {
                        <v-value [value]="item" inline></v-value>
                    }
                </div>
            } @else {
                <v-value [value]="items[0]" inline></v-value>
            }
        } @else {
            <v-value [progress]="true" inline></v-value>
        }
    `,
    styles: `
        .list {
            display: flex;
            flex-direction: column;

            & > * {
                overflow: hidden;
                text-overflow: ellipsis;
                min-height: 20px;
            }
        }
    `,
})
export class ValueListComponent {
    list = input<Value[] | undefined | null>();
}
