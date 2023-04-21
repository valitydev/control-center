import { Component } from '@angular/core';
import { DialogService } from '@vality/ng-core';

import {
    createGridColumns,
    createDescriptionFormattedColumn,
    createDatetimeFormattedColumn,
} from '@cc/components/simple-table';

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
        createDescriptionFormattedColumn('name', 'id'),
        'identity',
        'currency_symbolic_code',
        createDatetimeFormattedColumn('created_at'),
    ]);

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private dialogService: DialogService
    ) {}

    create() {
        this.dialogService.open(CreateSourceComponent);
    }
}
