import { Component, inject } from '@angular/core';
import { StatSource } from '@vality/fistful-proto/fistful_stat';
import { Column, DialogService } from '@vality/matez';

import { CreateSourceComponent } from './create-source/create-source.component';
import { FetchSourcesService } from './fetch-sources.service';

@Component({
    templateUrl: './sources.component.html',
    standalone: false,
})
export class SourcesComponent {
    private fetchSourcesService = inject(FetchSourcesService);
    private dialogService = inject(DialogService);

    sources$ = this.fetchSourcesService.sources$;
    progress$ = this.fetchSourcesService.progress$;
    columns: Column<StatSource>[] = [
        { field: 'id' },
        { field: 'name' },
        { field: 'identity' },
        { field: 'currency_symbolic_code' },
        { field: 'created_at', cell: { type: 'datetime' } },
    ];

    create() {
        this.dialogService.open(CreateSourceComponent);
    }
}
