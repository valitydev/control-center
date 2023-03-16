import { Component, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThriftAstMetadata } from '@vality/fistful-proto';
import { BaseDialogSuperclass } from '@vality/ng-core';
import { from } from 'rxjs';

import { FistfulAdminService } from '../../../api/fistful-admin';

@Component({
    selector: 'cc-create-source',
    templateUrl: './create-source.component.html',
})
export class CreateSourceComponent extends BaseDialogSuperclass<void> {
    control = new FormControl();
    metadata$ = from(
        import('@vality/fistful-proto/metadata.json').then((m) => m.default as ThriftAstMetadata[])
    );

    constructor(injector: Injector, private fistfulAdminService: FistfulAdminService) {
        super(injector);
    }

    create() {
        this.fistfulAdminService.CreateSource(this.control.value);
    }
}
