import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'cc-page-layout-actions',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutActionsComponent {}
