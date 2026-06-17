import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ActionsModule } from '@vality/matez';

@Component({
    selector: 'cc-card-actions',
    imports: [ActionsModule],
    templateUrl: './card-actions.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [],
})
export class CardActionsComponent {}
