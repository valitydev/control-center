import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cc-show-more-button',
    templateUrl: './show-more-button.component.html',
})
export class ShowMoreButtonComponent {
    @Input() inProgress: boolean;
    @Output() fetchMore = new EventEmitter();
}
