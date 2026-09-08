import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'cc-organizations',
    imports: [RouterOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './organizations.component.html',
})
export class OrganizationsComponent {}
