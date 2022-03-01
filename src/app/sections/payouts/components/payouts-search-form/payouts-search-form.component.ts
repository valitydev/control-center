import { Component } from '@angular/core';
import { FormBuilder } from '@ngneat/reactive-forms';

@Component({
    selector: 'cc-payouts-search-form',
    templateUrl: './payouts-search-form.component.html',
})
export class PayoutsSearchFormComponent {
    form = this.fb.group({ payoutId: null, merchant: null });

    constructor(private fb: FormBuilder) {}
}
