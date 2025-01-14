import { Component, Input, booleanAttribute } from '@angular/core';

@Component({
    selector: 'cc-details-item',
    templateUrl: 'details-item.component.html',
    styleUrls: ['details-item.component.scss'],
    standalone: false,
})
export class DetailsItemComponent {
    @Input() title: string;
    @Input({ transform: booleanAttribute }) empty: boolean;
}
