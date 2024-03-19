import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    booleanAttribute,
    input,
    computed,
    Output,
    EventEmitter,
} from '@angular/core';
import { Params, Router } from '@angular/router';

@Component({
    selector: 'cc-page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['./page-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayoutComponent {
    @Input() title!: string;
    @Input() description?: string;
    @Input() id?: string;
    @Input() progress?: boolean;
    @Input() path?: {
        label: string;
        link?: unknown[] | string | null | undefined;
        queryParams?: Params | null;
        tooltip?: string;
    }[];
    @Input({ transform: booleanAttribute }) noOffset = false;

    @Output() idLinkClick = new EventEmitter<MouseEvent>();

    backLink = input<unknown[]>();
    upLink = input<unknown[]>();
    idLink = input<unknown[]>();

    isBackAvailable = computed(
        () =>
            this.backLink() ||
            this.upLink() ||
            // 1 and 2 is default history length
            (window.history.length > 2 && window.location.pathname.split('/').slice(1).length > 1),
    );

    constructor(
        private location: Location,
        private router: Router,
    ) {}

    back() {
        if (this.backLink() || this.upLink()) {
            void this.router.navigate(this.backLink() || this.upLink());
        } else {
            this.location.back();
        }
    }
}
