import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { DialogSuperclass } from '@vality/ng-core';
import { from } from 'rxjs';

import { FistfulAdminService } from '../../../api/fistful-admin';
import { NotificationService } from '../../../shared/services/notification';
import { NotificationErrorService } from '../../../shared/services/notification-error';

@Component({
    selector: 'cc-create-source',
    templateUrl: './create-source.component.html',
})
export class CreateSourceComponent extends DialogSuperclass<void> {
    control = new FormControl();
    metadata$ = from(
        import('@vality/fistful-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
    );

    constructor(
        injector: Injector,
        private fistfulAdminService: FistfulAdminService,
        private errorService: NotificationErrorService,
        private notificationService: NotificationService
    ) {
        super(injector);
    }

    create() {
        this.fistfulAdminService.CreateSource(this.control.value).subscribe({
            next: () => {
                this.closeWithSuccess();
                this.notificationService.success('Source created successfully!');
            },
            error: (err) => {
                this.errorService.error(err);
            },
        });
    }
}
