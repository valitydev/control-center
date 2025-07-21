import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, map, shareReplay, startWith } from 'rxjs/operators';

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
    path = computed(() => this.getPath());
    path$ = toObservable(this.path);

    private getUrl() {
        return this.router.url && this.router.url !== '/'
            ? this.router.url.split('?', 1)[0].split('#', 1)[0]
            : window.location.pathname;
    }

    private getPath(url: string = this.getUrl()): string[] {
        return url?.split('/')?.slice(1) ?? [];
    }
}
