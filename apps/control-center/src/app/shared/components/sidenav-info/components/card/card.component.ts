import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { SidenavInfoService } from '../../sidenav-info.service';
import { CardActionsComponent } from '../card-actions/card-actions.component';

@Component({
    selector: 'cc-card',
    imports: [CommonModule, MatDividerModule, MatIconModule],
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent {
    @Input() title: string;

    @ContentChild(CardActionsComponent) cardActionsComponent?: CardActionsComponent;

    constructor(public sidenavInfoService: SidenavInfoService) {}
}
