import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RepairStatus } from '@vality/repairer-proto';

import { MachinesService } from './services/machines.service';

@Component({
    selector: 'cc-repairing',
    templateUrl: './repairing.component.html',
    providers: [MachinesService],
})
export class RepairingComponent {
    machines$ = this.machinesService.searchResult$;
    inProgress$ = this.machinesService.doAction$;
    hasMore$ = this.machinesService.hasMore$;
    filters = this.fb.group({});
    selection: any;
    displayedColumns = [
        'id',
        'namespace',
        'createdAt',
        'status',
        'provider',
        'errorMessage',
        'history',
    ];
    statuses = Object.fromEntries(Object.entries(RepairStatus).map(([k, v]) => [v, k]));

    constructor(private machinesService: MachinesService, private fb: FormBuilder) {
        this.machinesService.search({});
    }

    repair() {}

    fetchMore() {
        this.machinesService.fetchMore();
    }
}
