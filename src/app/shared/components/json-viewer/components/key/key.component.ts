import { Component, Input } from '@angular/core';

import { Key } from '../../utils/get-inline';

@Component({
    selector: 'cc-key',
    templateUrl: './key.component.html',
})
export class KeyComponent {
    @Input() keys?: Key[];
    @Input() index?: number;
}
