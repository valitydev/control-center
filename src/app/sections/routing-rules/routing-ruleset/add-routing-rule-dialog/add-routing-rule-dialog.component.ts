import { Component, Injector } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';
import { domain } from '@vality/domain-proto';
import { Predicate } from '@vality/domain-proto/domain';
import { ObjectID } from '@vality/domain-proto/internal/domain';
import { DialogSuperclass, Option } from '@vality/ng-core';
import { map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { AddRoutingRuleDialogService, TerminalType } from './add-routing-rule-dialog.service';

@UntilDestroy()
@Component({
    templateUrl: 'add-routing-rule-dialog.component.html',
    styleUrls: ['add-routing-rule-dialog.component.scss'],
    providers: [AddRoutingRuleDialogService],
})
export class AddRoutingRuleDialogComponent extends DialogSuperclass<
    AddRoutingRuleDialogComponent,
    { refID: number }
> {
    form = this.addShopRoutingRuleDialogService.form;
    newTerminalOptionsForm = this.addShopRoutingRuleDialogService.newTerminalOptionsForm;
    predicateControl = this.fb.control<Predicate>(null, Validators.required);

    terminalType = TerminalType;
    riskScore = domain.RiskScore;
    terminalOptions$ = this.domainStoreService.getObjects('terminal').pipe(
        map((terminals): Option<ObjectID>[] =>
            terminals.map((t) => ({
                label: t.data.name,
                value: t.ref.id,
                description: String(t.ref.id),
            })),
        ),
    );

    constructor(
        injector: Injector,
        private addShopRoutingRuleDialogService: AddRoutingRuleDialogService,
        private domainStoreService: DomainStoreService,
        private fb: FormBuilder,
    ) {
        super(injector);
    }

    add() {
        this.addShopRoutingRuleDialogService.add(
            this.predicateControl.value,
            this.dialogData.refID,
        );
    }

    addOption() {
        this.addShopRoutingRuleDialogService.addOption();
    }

    removeOption(idx: number) {
        this.addShopRoutingRuleDialogService.removeOption(idx);
    }
}
