import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'cc-terms',
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './terms.component.html',
})
export class TermsComponent {}
