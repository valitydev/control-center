import { Component } from '@angular/core';
import { Source } from '@vality/fistful-proto/internal/source';
import { DialogService, Column } from '@vality/ng-core';

import { CreateSourceComponent } from './create-source/create-source.component';
import { FetchSourcesService } from './fetch-sources.service';

@Component({
    templateUrl: './sources.component.html',
})
export class SourcesComponent {
    sources$ = this.fetchSourcesService.sources$;
    progress$ = this.fetchSourcesService.progress$;
    columns: Column<Source>[] = [
        { field: 'name', description: 'id' },
        'identity',
        'currency_symbolic_code',
        { field: 'created_at', type: 'datetime' },
    ];

    constructor(
        private fetchSourcesService: FetchSourcesService,
        private dialogService: DialogService,
    ) {}

    create() {
        this.dialogService.open(CreateSourceComponent);
    }
}
