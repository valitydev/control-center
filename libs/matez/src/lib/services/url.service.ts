import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, map, shareReplay, startWith } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UrlService {
    url$ = this.router.events.pipe(
        startWith(null),
        map(() => this.url),
        filter((url) => this.router.navigated || (!!url && url !== '/')),
        distinctUntilChanged(),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    path$ = this.url$.pipe(
        map(() => this.path),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    get url() {
        return this.router.url && this.router.url !== '/'
            ? this.router.url.split('?', 1)[0].split('#', 1)[0]
            : window.location.pathname;
    }

    get path() {
        return this.url?.split('/')?.slice(1) ?? [];
    }

    constructor(private router: Router) {}
}
