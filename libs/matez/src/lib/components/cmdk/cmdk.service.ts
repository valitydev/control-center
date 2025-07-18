import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CmdkComponent } from './cmdk.component';

@Injectable({
    providedIn: 'root',
})
export class CmdkService {
    private dialog = inject(MatDialog);

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

    private listener = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.toggle();
        }
    };
}
