import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractTemplateRef } from '@vality/domain-proto/lib/domain';
import { ContractTemplate } from '@vality/dominant-cache-proto';
import isNil from 'lodash-es/isNil';
import sortBy from 'lodash-es/sortBy';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';

@Component({
    selector: 'cc-contract-template-ref',
    templateUrl: 'contract-template-ref.component.html',
})
export class ContractTemplateRefComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() required: boolean;
    @Input() initialValue: ContractTemplateRef;

    contracts$: Observable<ContractTemplate[]>;
    isLoading = true;

    constructor(
        private fb: FormBuilder,
        private dominantCacheService: DominantCacheService,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const templateId = this.initialValue?.id;
        this.form.registerControl(
            'id',
            this.fb.control(
                {
                    value: templateId,
                    disabled: isNil(templateId),
                },
                this.required ? Validators.required : null
            )
        );
        this.form.updateValueAndValidity();
        this.contracts$ = this.dominantCacheService.GetContractTemplates().pipe(
            map((templates) => sortBy(templates, (o) => Number(o.ref))),
            tap(
                () => {
                    this.form.controls.id.enable();
                    this.isLoading = false;
                },
                () => {
                    this.isLoading = false;
                    this.snackBar.open('An error occurred while contract template receiving', 'OK');
                }
            )
        );
    }
}
