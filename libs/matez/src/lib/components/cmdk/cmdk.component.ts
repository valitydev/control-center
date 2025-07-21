import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

import { getValueChanges } from '../../utils';

import { CmdkService } from './cmdk.service';

@Component({
    selector: 'v-cmdk',
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatListModule,
        MatIconModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatProgressBarModule,
    ],
    templateUrl: './cmdk.component.html',
    styleUrl: './cmdk.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CmdkComponent {
    private cmdkService = inject(CmdkService);
    private dr = inject(DestroyRef);

    searchControl = new FormControl('');
    options$ = this.cmdkService.options$;
    inProgress$ = this.cmdkService.inProgress$;

    constructor() {
        console.log(this.searchControl);
        getValueChanges(this.searchControl)
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((searchStr) => {
                this.cmdkService.search$.next(searchStr || '');
            });
    }
}
