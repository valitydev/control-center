import { Component, Input } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
    selector: 'cc-label',
    templateUrl: './label.component.html',
    styleUrls: ['./label.component.scss'],
})
export class LabelComponent {
    @Input() label: string;
    @Input() color?: ThemePalette;
}
