import { Injectable, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    BehaviorSubject,
    Subject,
    debounceTime,
    distinctUntilChanged,
    finalize,
    shareReplay,
    switchMap,
    tap,
} from 'rxjs';

import { getPossiblyAsyncObservable } from '../../utils';

import { CmdkComponent } from './cmdk.component';
import { CmdkOptions } from './types/cmdk-options';

@Injectable({
    providedIn: 'root',
})
export class CmdkService implements OnDestroy {
    private dialog = inject(MatDialog);
    private options: CmdkOptions = {
        search: () => [],
    };
    search$ = new Subject<string>();

    inProgress$ = new BehaviorSubject(false);
    options$ = this.search$.pipe(
        distinctUntilChanged(),
        tap(() => this.inProgress$.next(true)),
        debounceTime(300),
        switchMap((searchStr) =>
            getPossiblyAsyncObservable(this.options.search(searchStr)).pipe(
                finalize(() => this.inProgress$.next(false)),
            ),
        ),
        shareReplay(1),
    );

    constructor() {
        document.addEventListener('keydown', this.listener);
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
        this.options = options;
    }

    private listener = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.toggle();
        }
    };
}
