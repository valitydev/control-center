import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'v-table-inputs',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TableInputsComponent {}
