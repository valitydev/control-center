import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';

import { RoutingRulesService } from '../../services/routing-rules';

@Component({
    selector: 'cc-initialize-routing-rules-dialog',
    templateUrl: 'initialize-routing-rules-dialog.component.html',
})
export class InitializeRoutingRulesDialogComponent extends DialogSuperclass<
    InitializeRoutingRulesDialogComponent,
    { partyID: string; refID: number }
> {
    form = this.fb.group({
        delegateDescription: 'Main delegate[party]',
        name: 'submain ruleset[by shop id]',
        description: '',
    });

    constructor(
        private fb: UntypedFormBuilder,
        private routingRulesService: RoutingRulesService,
        private log: NotifyLogService,
        private destroyRef: DestroyRef,
    ) {
        super();
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
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.dialogRef.close(), this.log.error);
    }
}
