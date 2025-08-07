import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'v-table-actions',
    template: `
        <v-actions>
            <ng-content></ng-content>
        </v-actions>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false,
})
export class TableActionsComponent {}
