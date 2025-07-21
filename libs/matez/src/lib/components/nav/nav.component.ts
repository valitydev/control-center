import { CommonModule } from '@angular/common';
import {
    Component,
    Injector,
    ViewEncapsulation,
    inject,
    input,
    runInInjectionContext,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { isNil } from 'lodash-es';
import {
    Observable,
    combineLatest,
    combineLatestWith,
    map,
    of,
    shareReplay,
    switchMap,
} from 'rxjs';

import { UrlService } from '../../services';
import { PossiblyAsyncValue, getPossiblyAsyncValue } from '../../utils';

export interface Link {
    label?: string;
    url?: string;
    icon?: string;
    children?: Link[];
    isHidden?: PossiblyAsyncValue<boolean>;
}

function isActiveLink(link: Link, url: string): boolean {
    return !isNil(url) && url.startsWith(link.url || '');
}

function getActiveLinks(links: Link[], url: string): Link[] {
    return links.reduce((acc, link) => {
        if (isActiveLink(link, url)) {
            acc.push(link);
        }
        return acc.concat(getActiveLinks(link.children || [], url));
    }, [] as Link[]);
}

@Component({
    selector: 'v-nav',
    styleUrls: ['./nav.component.scss'],
    templateUrl: './nav.component.html',
    imports: [RouterLink, MatButtonModule, MatDividerModule, CommonModule, MatIconModule],
    encapsulation: ViewEncapsulation.None,
})
export class NavComponent {
    private urlService = inject(UrlService);
    private injector = inject(Injector);

    links = input<Link[]>([]);

    viewedLinks$ = toObservable(this.links).pipe(
        switchMap((links) => this.getViewedLinks(links)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    activeLinks$ = this.viewedLinks$.pipe(
        combineLatestWith(this.urlService.url$),
        map(([links, url]) => getActiveLinks(links, url)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    getViewedLinks(links: Link[]): Observable<Link[]> {
        return combineLatest(
            links.map((link) =>
                runInInjectionContext(this.injector, () => getPossiblyAsyncValue(link.isHidden)),
            ),
        ).pipe(
            map((hiddenStates) => links.filter((_, index) => !hiddenStates[index])),
            switchMap((filteredLinks) =>
                combineLatest(
                    filteredLinks.map((link) =>
                        link.children ? this.getViewedLinks(link.children) : of([]),
                    ),
                ).pipe(
                    map(
                        (childrenLinks) =>
                            filteredLinks.map((link, index) => ({
                                ...link,
                                children: childrenLinks[index],
                            })) as Link[],
                    ),
                ),
            ),
        );
    }
}
