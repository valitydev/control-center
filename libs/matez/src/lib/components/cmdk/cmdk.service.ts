import { Injectable, inject } from '@angular/core';
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

import { PossiblyAsync, getPossiblyAsyncObservable } from '../../utils';

import { CmdkComponent } from './cmdk.component';

export interface CmdkOption {
    label: string;
    icon?: string;
    url?: string;
}

export interface CmdkOptions {
    search: (searchStr: string) => PossiblyAsync<CmdkOption[]>;
}

@Injectable({
    providedIn: 'root',
})
export class CmdkService {
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

    ngOnDestoroy() {
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
