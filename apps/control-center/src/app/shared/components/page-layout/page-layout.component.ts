import { Location } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    booleanAttribute,
    computed,
    input,
} from '@angular/core';
import { Router } from '@angular/router';
import { Color, UrlService } from '@vality/matez';
import { map } from 'rxjs/operators';

@Component({
    selector: 'cc-page-layout',
    templateUrl: './page-layout.component.html',
    styleUrls: ['./page-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PageLayoutComponent {
    @Input() title!: string;
    @Input() description?: string;
    @Input() id?: string | number;
    @Input() progress?: boolean;
    @Input() tags?: { value: string; color: Color }[] | null;

    @Output() idLinkClick = new EventEmitter<MouseEvent>();

    backLink = input<unknown[]>();
    upLink = input<unknown[]>();
    idLink = input<unknown[]>();
    fullHeight = input(false, { transform: booleanAttribute });

    isBackAvailable = computed(
        () =>
            this.backLink() ||
            this.upLink() ||
            // 1 and 2 is default history length
            (window.history.length > 2 && window.location.pathname.split('/').slice(1).length > 1),
    );

    path$ = this.urlService.path$.pipe(
        map((path) => {
            return path
                .reduce(
                    (acc, p) => {
                        acc.push({ url: [...(acc.at(-1)?.url || ['']), p], label: p });
                        return acc;
                    },
                    [] as { url: string[]; label: string }[],
                )
                .map((v) => ({ ...v, url: v.url.join('/') }));
        }),
    );

    constructor(
        private location: Location,
        private router: Router,
        private urlService: UrlService,
    ) {}

    back() {
        if (this.backLink() || this.upLink()) {
            void this.router.navigate(this.backLink() || this.upLink());
        } else {
            this.location.back();
        }
    }
}
