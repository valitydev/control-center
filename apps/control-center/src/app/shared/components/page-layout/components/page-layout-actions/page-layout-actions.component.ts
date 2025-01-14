import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'cc-page-layout-actions',
    template: `<v-actions><ng-content></ng-content></v-actions>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PageLayoutActionsComponent {}
