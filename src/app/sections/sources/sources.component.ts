import { Component } from '@angular/core';
import {
    DialogService,
    createGridColumns,
    createDescriptionFormatterColumn,
    createDatetimeFormatterColumn,
} from '@vality/ng-core';

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
        createDescriptionFormatterColumn('name', 'id'),
        'identity',
        'currency_symbolic_code',
        createDatetimeFormatterColumn('created_at'),
    ]);

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private dialogService: DialogService
    ) {}

    create() {
        this.dialogService.open(CreateSourceComponent);
    }
}
