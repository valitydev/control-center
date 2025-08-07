import { DestroyRef, Injectable, Injector, OnDestroy, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Subject, distinctUntilChanged, of, shareReplay, switchMap } from 'rxjs';

import { CmdkComponent } from './cmdk.component';
import { CmdkOptions } from './types/cmdk-options';

@Injectable({
    providedIn: 'root',
})
export class CmdkService implements OnDestroy {
    private dialog = inject(MatDialog);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);

    private config = signal<CmdkOptions | null>(null);
    search$ = new Subject<string>();
    inProgress$ = toObservable(this.config).pipe(
        switchMap((config) =>
            config?.progress
                ? toObservable(config.progress, { injector: this.injector })
                : of(false),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    options$ = toObservable(this.config).pipe(
        switchMap((config) =>
            config?.options ? toObservable(config.options, { injector: this.injector }) : of([]),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor() {
        document.addEventListener('keydown', this.listener);
        this.search$
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.dr))
            .subscribe((searchStr) => {
                this.config()?.search?.(searchStr);
            });
    }

    ngOnDestroy() {
        document.removeEventListener('keydown', this.listener);
    }

    open() {
        if (this.dialog.openDialogs.length) return;
        this.dialog.open(CmdkComponent, {
            width: 'calc(max(400px, 100vw - 32px))',
            maxWidth: '600px',
            position: { top: '20vh' },
            hasBackdrop: true,
            backdropClass: 'cmdk-backdrop',
            panelClass: 'cmdk-panel',
        });
    }

    close() {
        this.search$.next('');
        this.dialog.closeAll();
    }

    toggle() {
        if (this.dialog.openDialogs.length) {
            this.close();
        } else {
            this.open();
        }
    }

    init(options: CmdkOptions) {
        this.config.set(options);
    }

    private listener = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.toggle();
        }
    };
}
