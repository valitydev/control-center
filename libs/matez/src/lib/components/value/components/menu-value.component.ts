import { Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { TypedParamsValue } from '../types/base-type';

export interface MenuItem {
    label: string;
    click?: (event: MouseEvent) => void;
    disabled?: boolean;
}

export type MenuValue = TypedParamsValue<'menu', { items: MenuItem[] }>;

@Component({
    selector: 'v-menu-value',
    standalone: true,
    imports: [MatIcon, MatIconButton, MatMenu, MatMenuItem, MatMenuTrigger],
    template: ` @if (value(); as v) {
        <button [matMenuTriggerFor]="menu" class="button" mat-icon-button>
            <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
            @for (item of v.params.items; track item; let index = $index) {
                <button [disabled]="!!item?.disabled" mat-menu-item (click)="item?.click?.($event)">
                    {{ item.label }}
                </button>
            }
        </mat-menu>
    }`,
    styles: ``,
})
export class MenuValueComponent {
    value = input.required<MenuValue>();
}
