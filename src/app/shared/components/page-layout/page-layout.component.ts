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
    @Input() path?: {
        label: string;
        link?: unknown[] | string | null | undefined;
        tooltip?: string;
    }[];

    // 1 and 2 is default history length
    isBackAvailable =
        window.history.length > 2 && window.location.pathname.split('/').slice(1).length > 1;

    constructor(private location: Location) {}

    back() {
        this.location.back();
    }
}
