import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'cc-domain-object-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './domain-object-card.component.html',
    styles: [],
})
export class DomainObjectCardComponent {
    @Input() label: string;
}
