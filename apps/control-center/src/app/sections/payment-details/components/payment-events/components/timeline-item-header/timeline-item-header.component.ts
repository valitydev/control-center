import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HumanizedDurationPipe } from '@vality/matez';

@Component({
    selector: 'cc-timeline-item-header',
    templateUrl: 'timeline-item-header.component.html',
    imports: [HumanizedDurationPipe, DatePipe]
})
export class TimelineItemHeaderComponent {
    @Input() date: string;
    @Input() text: string;
}
