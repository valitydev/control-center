import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActionsModule } from '@vality/matez';

@Component({
    selector: 'cc-card-actions',
    standalone: true,
    imports: [CommonModule, ActionsModule],
    templateUrl: './card-actions.component.html',
    styles: [],
})
export class CardActionsComponent {}
