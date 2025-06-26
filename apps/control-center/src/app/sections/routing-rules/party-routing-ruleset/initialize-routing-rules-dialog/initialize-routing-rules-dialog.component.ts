import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { DialogSuperclass, NotifyLogService } from '@vality/matez';

import { RoutingRulesService } from '../../services/routing-rules';

@Component({
    selector: 'cc-initialize-routing-rules-dialog',
    templateUrl: 'initialize-routing-rules-dialog.component.html',
    standalone: false,
})
export class InitializeRoutingRulesDialogComponent extends DialogSuperclass<
    InitializeRoutingRulesDialogComponent,
    { partyID: string; refID: number }
> {
    private fb = inject(UntypedFormBuilder);
    private routingRulesService = inject(RoutingRulesService);
    private log = inject(NotifyLogService);
    private destroyRef = inject(DestroyRef);
    form = this.fb.group({
        delegateDescription: 'Main delegate[party]',
        name: 'submain ruleset[by shop id]',
        description: '',
    });

    constructor() {
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
