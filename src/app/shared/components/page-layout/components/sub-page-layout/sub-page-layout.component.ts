import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatSidenav, MatSidenavContent, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { NavComponent, TagModule, Color, Link } from '@vality/ng-core';

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
    ],
    templateUrl: './sub-page-layout.component.html',
    styles: ``,
})
export class SubPageLayoutComponent {
    links = input<Link[]>([]);
    tags = input<{ title: string; color?: Color }[]>([]);

    constructor(protected sidenavInfoService: SidenavInfoService) {}
}
