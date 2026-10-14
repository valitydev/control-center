import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MAT_SNACK_BAR_DATA,
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel,
    MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface NotifySnackBarData {
    message: string;
    trace?: string;
}

@Component({
    selector: 'v-notify-snack-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatSnackBarLabel,
        MatSnackBarActions,
        MatSnackBarAction,
    ],
    template: `
        <div matSnackBarLabel>{{ data.message }}</div>
        <div matSnackBarActions>
            @if (data.trace) {
                <button
                    mat-icon-button
                    matSnackBarAction
                    matTooltip="Copy trace"
                    (click)="copyTrace()"
                >
                    <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
                </button>
            }
            <button
                class="close"
                mat-icon-button
                matSnackBarAction
                matTooltip="Close"
                (click)="snackBarRef.dismissWithAction()"
            >
                <mat-icon>close</mat-icon>
            </button>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            --mat-icon-button-icon-color: var(
                --mat-snack-bar-supporting-text-color,
                var(--mat-sys-inverse-on-surface)
            );
            --mat-icon-button-state-layer-color: var(
                --mat-snack-bar-supporting-text-color,
                var(--mat-sys-inverse-on-surface)
            );
            --mat-icon-button-ripple-color: color-mix(
                in srgb,
                var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface)) 12%,
                transparent
            );
        }

        .close {
            --mat-icon-button-icon-color: var(--mat-sys-outline);
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
