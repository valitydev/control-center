import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HumanizedDurationPipe } from '@vality/ng-core';

@Component({
    selector: 'cc-timeline-item-header',
    standalone: true,
    templateUrl: 'timeline-item-header.component.html',
    imports: [HumanizedDurationPipe, DatePipe],
})
export class TimelineItemHeaderComponent {
    @Input() date: string;
    @Input() text: string;
}