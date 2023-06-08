import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'cc-page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['./page-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {
    @Input() title!: string;
    @Input() description?: string;
    @Input() progress?: boolean;

    // 1 and 2 is default history length
    isBackAvailable = window.history.length > 2;

    constructor(private location: Location) {}

    back() {
        this.location.back();
    }
}
