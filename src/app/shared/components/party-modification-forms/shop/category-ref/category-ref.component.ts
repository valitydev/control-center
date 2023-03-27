import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryRef } from '@vality/domain-proto/domain';
import { Category } from '@vality/dominant-cache-proto/dominant_cache';
import isNil from 'lodash-es/isNil';
import sortBy from 'lodash-es/sortBy';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DominantCacheService } from '@cc/app/api/dominant-cache';

@Component({
    selector: 'cc-category-ref',
    templateUrl: 'category-ref.component.html',
})
export class CategoryRefComponent implements OnInit {
    @Input() form: UntypedFormGroup;
    @Input() required: boolean;
    @Input() initialValue: CategoryRef;

    categories$: Observable<Category[]>;
    isLoading = true;

    constructor(
        private dominantCacheService: DominantCacheService,
        private fb: UntypedFormBuilder,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        const category = this.initialValue?.id;
        this.form.registerControl(
            'id',
            this.fb.control(
                {
                    value: category,
                    disabled: isNil(category),
                },
                this.required ? Validators.required : null
            )
        );
        this.categories$ = this.dominantCacheService.GetCategories().pipe(
            map((categories) => sortBy(categories, (o) => Number(o.ref))),
            tap(
                () => {
                    this.form.controls.id.enable();
                    this.isLoading = false;
                },
                () => {
                    this.isLoading = false;
                    this.snackBar.open('An error occurred while shop category receiving', 'OK');
                }
            )
        );
        this.form.updateValueAndValidity();
    }
}
