import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { ActionsModule, Color, Link, NavComponent, TagModule } from '@vality/matez';

import { SidenavInfoService } from '../../../sidenav-info';

@Component({
    selector: 'cc-sub-page-layout',
    standalone: true,
    imports: [
        CommonModule,
        NavComponent,
        MatSidenav,
        MatSidenavContent,
        MatToolbar,
        TagModule,
        MatSidenavContainer,
        ActionsModule,
    ],
    templateUrl: './sub-page-layout.component.html',
    styles: ``,
})
export class SubPageLayoutComponent {
    title = input<string>();
    id = input<string>();
    links = input<Link[]>([]);
    tags = input<{ value: string; color: Color }[] | null>([]);

    constructor(protected sidenavInfoService: SidenavInfoService) {}
}
