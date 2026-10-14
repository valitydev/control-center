import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel,
    MatSnackBarRef,
} from '@angular/material/snack-bar';

export interface NotifySnackBarData {
    message: string;
    trace?: string;
}

@Component({
    selector: 'v-notify-snack-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
    template: `
        <div matSnackBarLabel>{{ data.message }}</div>
        <div matSnackBarActions>
            @if (data.trace) {
                <button mat-button matSnackBarAction (click)="copyTrace()">
                    {{ copied() ? 'Copied' : 'Trace' }}
                </button>
            }
            <button mat-button matSnackBarAction (click)="snackBarRef.dismissWithAction()">
                OK
            </button>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
        }
    `,
})
export class NotifySnackBarComponent {
    private clipboard = inject(Clipboard);
    data = inject<NotifySnackBarData>(MAT_SNACK_BAR_DATA);
    snackBarRef = inject(MatSnackBarRef<NotifySnackBarComponent>);
    copied = signal(false);

    copyTrace() {
        if (this.data.trace) {
            this.clipboard.copy(this.data.trace);
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 1500);
        }
    }
}
