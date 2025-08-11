import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

import { ActionsModule, Color, TagModule } from '@vality/matez';

import { SidenavInfoService } from '../../../sidenav-info';

@Component({
    selector: 'cc-sub-page-layout',
    imports: [CommonModule, MatToolbar, TagModule, ActionsModule],
    templateUrl: './sub-page-layout.component.html',
    styles: ``,
})
export class SubPageLayoutComponent {
    protected sidenavInfoService = inject(SidenavInfoService);
    title = input<string>();
    id = input<string>();
    tags = input<{ value: string; color: Color }[] | null>([]);
}
