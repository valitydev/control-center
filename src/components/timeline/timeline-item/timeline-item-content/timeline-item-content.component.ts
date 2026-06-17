import { ChangeDetectionStrategy, Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'cc-timeline-item-content, [cc-timeline-item-content]',
    template: '<ng-content></ng-content>',
    styleUrls: ['timeline-item-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class TimelineItemContentComponent {
    @HostBinding('class.cc-timeline-item-content') rootClass = true;
}
