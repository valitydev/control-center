import { NgClass } from '@angular/common';
import { Component, OnInit, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CmdkService } from '../cmdk.service';
import { CmdkOption } from '../types/cmdk-option';

@Component({
    selector: 'v-cmdk-button',
    imports: [MatIconModule, NgClass, MatButtonModule],
    template: `
        <button
            class="!text-[var(--mat-sys-outline)] !shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1),inset_0_2px_2px_0_rgba(0,0,0,0.06)]"
            matButton
            (click)="cmdkService.open()"
        >
            <mat-icon>search</mat-icon>
            <div class="flex items-center gap-1">
                <div>Search...</div>
                <div class="flex items-center gap-0.5 text-xs">
                    @for (key of searchKeys; track key) {
                        <kbd
                            [ngClass]="{ 'px-1': key.length > 1 }"
                            class="bg-[var(--mat-sys-surface-container-high)] rounded min-w-4 h-4"
                            >{{ key }}</kbd
                        >
                    }
                </div>
            </div>
        </button>
    `,
})
export class CmdkButtonComponent implements OnInit {
    cmdkService = inject(CmdkService);

    searchChange = output<string>();
    options = input<CmdkOption[]>([]);
    progress = input<boolean>(false);

    searchKeys = [navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl', 'K'];

    ngOnInit() {
        this.cmdkService.init({
            search: (searchStr) => {
                this.searchChange.emit(searchStr);
            },
            options: this.options,
            progress: this.progress,
        });
    }
}
