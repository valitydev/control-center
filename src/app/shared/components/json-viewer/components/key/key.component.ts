import { Component, Input } from '@angular/core';

@Component({
    selector: 'cc-key',
    templateUrl: './key.component.html',
})
export class KeyComponent {
    @Input() keys?: any[];
    @Input() index?: number;
}
