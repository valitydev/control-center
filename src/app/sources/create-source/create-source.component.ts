import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DialogSuperclass, NotifyLogService } from '@vality/matez';

import { ThriftSourceManagementService } from '~/api/services';

@Component({
    selector: 'cc-create-source',
    templateUrl: './create-source.component.html',
    standalone: false,
})
export class CreateSourceComponent extends DialogSuperclass<void> {
    private sourceManagementService = inject(ThriftSourceManagementService);
    private log = inject(NotifyLogService);
    control = new FormControl();

    create() {
        this.sourceManagementService.Create(this.control.value, new Map()).subscribe({
            next: () => {
                this.closeWithSuccess();
                this.log.success('Source created successfully!');
            },
            error: (err) => {
                this.log.error(err);
            },
        });
    }
}
