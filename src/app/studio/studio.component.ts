import { Component } from '@angular/core';

import { SelectFieldModule } from '@vality/matez';

import { PageLayoutModule } from '~/components/page-layout';

@Component({
    selector: 'cc-studio',
    imports: [PageLayoutModule, SelectFieldModule],
    templateUrl: './studio.component.html',
})
export class StudioComponent {}
