import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Management } from '@vality/fistful-proto/source';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';

@Component({
    selector: 'cc-create-source',
    templateUrl: './create-source.component.html',
    standalone: false,
})
export class CreateSourceComponent extends DialogSuperclass<void> {
    private sourceManagementService = inject(Management);
    private log = inject(NotifyLogService);
    control = new FormControl();

    create() {
        this.sourceManagementService.CreateSource(this.control.value, new Map()).subscribe({
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
