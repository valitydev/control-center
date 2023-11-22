import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SidenavInfoService } from '../../sidenav-info.service';

@Component({
    selector: 'cc-card',
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatIconModule],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
})
export class CardComponent {
    @Input() title: string;

    constructor(public sidenavInfoService: SidenavInfoService) {}
}
