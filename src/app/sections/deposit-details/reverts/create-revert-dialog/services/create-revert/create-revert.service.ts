import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RevertParams } from '@vality/fistful-proto/deposit_revert';
import { EMPTY, merge, ReplaySubject, Subject } from 'rxjs';
import { catchError, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { ManagementService } from '@cc/app/api/deposit';
import { progress } from '@cc/app/shared/custom-operators';
import { UserInfoBasedIdGeneratorService } from '@cc/app/shared/services';
import { toMinor } from '@cc/utils/to-minor';

import { CreateRevertDialogConfig } from '../../types/create-revert-dialog-config';

@Injectable()
export class CreateRevertService {
    private create$ = new Subject<void>();
    private errorSubject$ = new Subject<boolean>();
    private depositID$ = new ReplaySubject<string>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    revertCreated$ = this.create$.pipe(
        map(() => this.getParams()),
        withLatestFrom(this.depositID$),
        switchMap(([params, depositID]) =>
            this.depositManagementService.CreateRevert(depositID, params).pipe(
                catchError((e) => {
                    console.error(e);
                    this.errorSubject$.next(true);
                    return EMPTY;
                })
            )
        ),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.create$, merge([this.revertCreated$, this.errorSubject$]));

    // eslint-disable-next-line @typescript-eslint/member-ordering
    error$ = this.errorSubject$.asObservable();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    form: UntypedFormGroup;

    constructor(
        private fb: UntypedFormBuilder,
        private idGenerator: UserInfoBasedIdGeneratorService,
        private depositManagementService: ManagementService
    ) {}

    createRevert() {
        this.create$.next();
    }

    init(params: CreateRevertDialogConfig): void {
        const { depositID, currency } = params;
        this.depositID$.next(depositID);
        this.form = this.fb.group({
            amount: ['', [Validators.required, Validators.pattern(/^\d+([,.]\d{1,2})?$/)]],
            currency: [currency, Validators.required],
            reason: '',
            externalID: '',
        });
    }

    private getParams(): RevertParams {
        const { reason, amount, currency, externalID } = this.form.value;
        return {
            id: this.idGenerator.getUsernameBasedId(),
            body: {
                amount: toMinor(amount),
                currency: {
                    symbolic_code: currency,
                },
            },
            reason,
            external_id: externalID,
        };
    }
}
