import { distinctUntilChanged, filter, map, shareReplay, startWith } from 'rxjs/operators';

import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

export function getUrlPath(url: string): string[] {
    return url?.split('/')?.slice(1) ?? [];
}

@Injectable({
    providedIn: 'root',
})
export class UrlService {
    private router = inject(Router);

    url$ = this.router.events.pipe(
        startWith(null),
        map(() => this.getUrl()),
        filter((url) => this.router.navigated || (!!url && url !== '/')),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    url = toSignal(this.url$, { initialValue: this.getUrl() });
    path = computed(() => getUrlPath(this.url()));
    path$ = toObservable(this.path);

    private getUrl() {
        return this.router.url && this.router.url !== '/'
            ? this.router.url.split('?', 1)[0].split('#', 1)[0]
            : window.location.pathname;
    }
}
