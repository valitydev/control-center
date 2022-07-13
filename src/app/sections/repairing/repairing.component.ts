import { Component } from '@angular/core';

import { RepairManagementService } from '../../api/repairer';

@Component({
    selector: 'cc-repairing',
    templateUrl: './repairing.component.html',
})
export class RepairingComponent {
    machines$ = this.repairManagementService.Search({ limit: 10 });

    constructor(private repairManagementService: RepairManagementService) {}
}
