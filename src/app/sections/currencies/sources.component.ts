import { Component } from '@angular/core';
import { BaseDialogService } from '@vality/ng-core';

import { Columns } from '../../../components/table';
import { CreateSourceComponent } from './create-source/create-source.component';
import { FetchSourcesService } from './fetch-sources.service';

@Component({
    templateUrl: './sources.component.html',
    styles: [
        `
            :host {
                display: block;
                padding: 24px 16px;
            }
        `,
    ],
})
export class SourcesComponent {
    sources$ = this.fetchSourcesService.sources$;
    progress$ = this.fetchSourcesService.progress$;
    cols = new Columns('id', 'name', 'identity', 'currency_symbolic_code');

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private baseDialogService: BaseDialogService
    ) {}

    create() {
        this.baseDialogService.open(CreateSourceComponent);
    }
}
