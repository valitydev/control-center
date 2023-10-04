import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { SidenavInfoService } from './sidenav-info.service';

@Component({
    standalone: true,
    selector: 'cc-sidenav-info',
    templateUrl: './sidenav-info.component.html',
    styleUrls: ['./sidenav-info.component.scss'],
    imports: [CommonModule, MatSidenavModule, MatIconModule, MatListModule, FlexModule],
})
export class SidenavInfoComponent {
    constructor(public sidenavInfoService: SidenavInfoService) {}
}
