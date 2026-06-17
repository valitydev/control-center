import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
    selector: 'cc-headline',
    templateUrl: 'headline.component.html',
    styleUrls: ['headline.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class HeadlineComponent {
    private location = inject(Location);
    // 1 and 2 is default history length
    isBackAvailable = window.history.length > 2;

    back() {
        this.location.back();
    }
}
