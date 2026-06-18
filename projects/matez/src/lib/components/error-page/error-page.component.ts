import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    templateUrl: 'error-page.component.html',
    styleUrls: ['error-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ErrorPageComponent {}
