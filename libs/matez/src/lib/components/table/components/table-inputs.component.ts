import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'v-table-inputs',
    template: `<ng-content></ng-content>`,
    styles: [
        `
            :host {
                display: block;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TableInputsComponent {}
