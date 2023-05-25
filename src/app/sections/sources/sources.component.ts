import { Component } from '@angular/core';
import { DialogService, createGridColumns, createDescriptionColumn } from '@vality/ng-core';

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
    columns = createGridColumns([
        createDescriptionColumn('name', 'id'),
        'identity',
        'currency_symbolic_code',
        { field: 'created_at', type: 'date' },
    ]);

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private dialogService: DialogService
    ) {}

    create() {
        this.dialogService.open(CreateSourceComponent);
    }
}
