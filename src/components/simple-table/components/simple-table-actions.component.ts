import { Component } from '@angular/core';

@Component({
    selector: 'cc-simple-table-actions',
    template: `
        <div fxLayout fxLayoutGap="16px">
            <ng-content></ng-content>
        </div>
    `,
})
export class SimpleTableActionsComponent {}
