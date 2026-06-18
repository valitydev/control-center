import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { SidenavInfoService } from './sidenav-info.service';

@Component({
    selector: 'cc-sidenav-info',
    templateUrl: './sidenav-info.component.html',
    styleUrls: ['./sidenav-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatSidenavModule, MatIconModule, MatListModule],
})
export class SidenavInfoComponent {
    public sidenavInfoService = inject(SidenavInfoService);
}
