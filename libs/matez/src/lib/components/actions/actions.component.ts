import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'v-actions',
    templateUrl: 'actions.component.html',
    styleUrls: ['actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ActionsComponent {}
