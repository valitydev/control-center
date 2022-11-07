import { Component, Input } from '@angular/core';
import { coerceBoolean } from 'coerce-property';

@Component({
    selector: 'cc-details-item',
    templateUrl: 'details-item.component.html',
    styleUrls: ['details-item.component.scss'],
})
export class DetailsItemComponent {
    @Input() title: string;
    @Input() @coerceBoolean empty: boolean;
}
