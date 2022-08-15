import { Component, Injector } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogSuperclass } from '@vality/ng-core';

import { ErrorService } from '../../../../shared/services/error';
import { RoutingRulesService } from '../../../../thrift-services';

@UntilDestroy()
@Component({
    selector: 'cc-initialize-routing-rules-dialog',
    templateUrl: 'initialize-routing-rules-dialog.component.html',
})
export class InitializeRoutingRulesDialogComponent extends BaseDialogSuperclass<
    InitializeRoutingRulesDialogComponent,
    { partyID: string; refID: number }
> {
    form = this.fb.group({
        delegateDescription: 'Main delegate[party]',
        name: 'submain ruleset[by shop id]',
        description: '',
    });

    constructor(
        injector: Injector,
        private fb: UntypedFormBuilder,
        private routingRulesService: RoutingRulesService,
        private errorService: ErrorService
    ) {
        super(injector);
    }

    init() {
        const { delegateDescription, name, description } = this.form.value;
        this.routingRulesService
            .addPartyRuleset({
                name,
                partyID: this.dialogData.partyID,
                mainRulesetRefID: this.dialogData.refID,
                description,
                delegateDescription,
            })
            .pipe(untilDestroyed(this))
            .subscribe(() => this.dialogRef.close(), this.errorService.error);
    }
}
