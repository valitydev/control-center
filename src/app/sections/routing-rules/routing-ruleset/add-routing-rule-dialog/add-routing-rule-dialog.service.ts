import { Injectable } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Predicate } from '@vality/domain-proto/lib/domain';
import { of } from 'rxjs';
import { startWith, switchMap, take } from 'rxjs/operators';

import { BaseDialogResponseStatus } from '@cc/components/base-dialog';

import { RoutingRulesService } from '../../../../thrift-services';
import { AddRoutingRuleDialogComponent } from './add-routing-rule-dialog.component';

export enum TerminalType {
    New = 'new',
    Existent = 'existent',
}

@Injectable()
export class AddRoutingRuleDialogService {
    form = this.fb.group({
        description: '',
        weight: '',
        priority: 1000,
        terminalType: [null, Validators.required],
        existentTerminalID: ['', Validators.required],
        newTerminal: this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            riskCoverage: [null, Validators.required],
            options: this.fb.array([this.createOption()]),
        }),
    });

    get newTerminalOptionsForm() {
        return this.form.get('newTerminal').get('options') as UntypedFormArray;
    }

    constructor(
        private fb: UntypedFormBuilder,
        private dialogRef: MatDialogRef<AddRoutingRuleDialogComponent>,
        private routingRulesService: RoutingRulesService
    ) {
        this.form
            .get('terminalType')
            .valueChanges.pipe(startWith(this.form.value.terminalType))
            .subscribe((type) => {
                const { newTerminal, existentTerminalID } = this.form.controls;
                switch (type) {
                    case TerminalType.New:
                        newTerminal.enable();
                        existentTerminalID.disable();
                        return;
                    case TerminalType.Existent:
                        newTerminal.disable();
                        existentTerminalID.enable();
                        return;
                    default:
                        newTerminal.disable();
                        existentTerminalID.disable();
                        return;
                }
            });
    }

    add(predicate: Predicate, refID: number) {
        const { description, weight, priority, terminalType, existentTerminalID, newTerminal } =
            this.form.value;
        (terminalType === TerminalType.New
            ? this.routingRulesService.createTerminal({
                  name: newTerminal.name,
                  description: newTerminal.description,
                  risk_coverage: newTerminal.riskCoverage,
                  options: newTerminal.options,
              })
            : of(existentTerminalID)
        )
            .pipe(
                take(1),
                switchMap((terminalID) =>
                    this.routingRulesService.addShopRule({
                        description,
                        weight,
                        priority,
                        terminalID,
                        refID,
                        predicate,
                    })
                )
            )
            .subscribe(() => this.dialogRef.close({ status: BaseDialogResponseStatus.Success }));
    }

    addOption() {
        this.newTerminalOptionsForm.push(this.createOption());
    }

    removeOption(idx: number) {
        this.newTerminalOptionsForm.removeAt(idx);
    }

    private createOption() {
        return this.fb.group({ key: ['', Validators.required], value: ['', Validators.required] });
    }
}
