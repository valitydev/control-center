import { Directive, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { getValue } from '../get-value';
import { hasControls } from '../has-controls';

import { AbstractControlSuperclass } from './abstract-control-superclass';

@Directive()
export abstract class FormGroupSuperclass<OuterType, InnerType = OuterType>
    extends AbstractControlSuperclass<OuterType, InnerType>
    implements OnInit
{
    protected emptyValue!: InnerType;

    override setDisabledState(_isDisabled: boolean): void {
        return;
    }

    override ngOnInit() {
        this.emptyValue = getValue(this.control) as InnerType;
        super.ngOnInit();
    }

    protected override outerToInnerValue(outer: OuterType): InnerType {
        if (hasControls(this.control)) {
            if (!outer) {
                return this.emptyValue;
            }
            if (
                Object.keys(outer).length < Object.keys((this.control as FormGroup).controls).length
            ) {
                return Object.assign({}, this.emptyValue, outer);
            }
        }
        return outer as never;
    }
}
