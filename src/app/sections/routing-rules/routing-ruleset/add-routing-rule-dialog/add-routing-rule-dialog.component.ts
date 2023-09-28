import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Predicate } from '@vality/domain-proto/domain';
import { DialogSuperclass, DialogResponseStatus } from '@vality/ng-core';
import { of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

import { RoutingRulesService } from '../../services/routing-rules';

@UntilDestroy()
@Component({
    templateUrl: 'add-routing-rule-dialog.component.html',
    styleUrls: ['add-routing-rule-dialog.component.scss'],
})
export class AddRoutingRuleDialogComponent extends DialogSuperclass<
    AddRoutingRuleDialogComponent,
    { refID: number; idx?: number }
> {
    form = this.fb.group({
        description: '',
        weight: null as number,
        priority: 1000,
        existentTerminalID: [null as number, Validators.required],
    });
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    constructor(
        injector: Injector,
        private fb: FormBuilder,
        private routingRulesService: RoutingRulesService,
    ) {
        super(injector);
    }

    add() {
        const { description, weight, priority, existentTerminalID } = this.form.value;
        of(existentTerminalID)
            .pipe(
                take(1),
                switchMap((terminalID) =>
                    this.routingRulesService.addShopRule({
                        description,
                        weight,
                        priority,
                        terminalID,
                        refID: this.dialogData.refID,
                        predicate: this.predicateControl.value,
                    }),
                ),
            )
            .subscribe(() => this.dialogRef.close({ status: DialogResponseStatus.Success }));
    }
}
