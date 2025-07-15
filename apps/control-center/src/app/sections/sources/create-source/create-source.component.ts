import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';
import { throwError } from 'rxjs';

@Component({
    selector: 'cc-create-source',
    templateUrl: './create-source.component.html',
    standalone: false,
})
export class CreateSourceComponent extends DialogSuperclass<void> {
    // private fistfulAdminService = inject(FistfulAdminService);
    private log = inject(NotifyLogService);
    control = new FormControl();

    create() {
        // TODO: Wait fistful-admin service
        // this.fistfulAdminService.CreateSource(this.control.value).subscribe({
        throwError(new Error('No fistful-admin service')).subscribe({
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
