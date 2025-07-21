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
import { Overwrite } from 'utility-types';

import { UrlService } from '../../services';
import { PossiblyAsyncValue, getPossiblyAsyncValue } from '../../utils';

export interface BaseLink {
    label?: string;
    url?: string;
    icon?: string;
    children?: BaseLink[];
    isHidden?: boolean;
}

export type Link = PossiblyAsyncValue<Overwrite<BaseLink, { children?: Link[] }>, [url: string]>;

function isActiveLink(link: BaseLink, url: string): boolean {
    return !isNil(url) && url.startsWith(link.url || '');
}

function getActiveLinks(links: BaseLink[], url: string): BaseLink[] {
    return links.reduce((acc, link) => {
        if (isActiveLink(link, url)) {
            acc.push(link);
        }
        return acc.concat(getActiveLinks(link.children || [], url));
    }, [] as BaseLink[]);
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

    viewedLinks$ = combineLatest([toObservable(this.links), this.urlService.url$]).pipe(
        switchMap(([links, url]) => this.getViewedLinks(links, url)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    activeLinks$ = this.viewedLinks$.pipe(
        combineLatestWith(this.urlService.url$),
        map(([links, url]) => getActiveLinks(links, url)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    getViewedLinks(links: Link[], url: string): Observable<BaseLink[]> {
        return combineLatest(
            links.map((link) =>
                runInInjectionContext(this.injector, () => getPossiblyAsyncValue(link, [url])),
            ),
        ).pipe(
            switchMap((links) =>
                combineLatest(
                    links.map((link) =>
                        link.children ? this.getViewedLinks(link.children, url) : of(undefined),
                    ),
                ).pipe(
                    map((children) =>
                        links
                            .map((link, index) => ({
                                ...link,
                                children: children[index],
                            }))
                            .filter((link) => !link.isHidden),
                    ),
                ),
            ),
        );
    }
}
