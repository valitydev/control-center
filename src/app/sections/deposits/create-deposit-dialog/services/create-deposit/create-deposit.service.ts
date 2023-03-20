import { Injectable } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { DepositParams } from '@vality/fistful-proto/fistful_admin';
import { StatDeposit, StatRequest } from '@vality/fistful-proto/fistful_stat';
import { StatSource } from '@vality/fistful-proto/internal/fistful_stat';
import * as moment from 'moment';
import { EMPTY, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, first } from 'rxjs/operators';

import { FistfulAdminService } from '@cc/app/api/fistful-admin';
import { depositParamsToRequest, FistfulStatisticsService } from '@cc/app/api/fistful-stat';
import { progress } from '@cc/app/shared/custom-operators';
import { UserInfoBasedIdGeneratorService } from '@cc/app/shared/services';
import { createDepositStopPollingCondition } from '@cc/app/shared/utils';
import { poll } from '@cc/utils/poll';
import { toMinor } from '@cc/utils/to-minor';

import { ConfigService } from '../../../../../core/config.service';
import { FetchSourcesService } from '../../../../sources';

@Injectable()
export class CreateDepositService {
    private create$ = new Subject<void>();
    private errorSubject$ = new Subject<boolean>();
    private pollingErrorSubject$ = new Subject<boolean>();
    private pollingTimeoutSubject$ = new Subject<boolean>();

    // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/no-unsafe-assignment
    depositCreated$: Observable<StatDeposit> = this.create$.pipe(
        map(() => this.getParams()),
        switchMap((params) =>
            forkJoin([
                of(this.getPollingParams(params)),
                this.fistfulAdminService.CreateDeposit(params).pipe(
                    catchError(() => {
                        this.errorSubject$.next(true);
                        return EMPTY;
                    })
                ),
            ])
        ),
        switchMap(([pollingParams]) =>
            this.fistfulStatisticsService.GetDeposits(pollingParams).pipe(
                catchError(() => {
                    this.pollingErrorSubject$.next(true);
                    return EMPTY;
                }),
                map((res) => res.data?.deposits[0]),
                poll(createDepositStopPollingCondition),
                catchError(() => {
                    this.pollingTimeoutSubject$.next(true);
                    return EMPTY;
                })
            )
        )
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(
        this.create$,
        merge([this.depositCreated$, this.errorSubject$, this.pollingErrorSubject$])
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    error$ = this.errorSubject$.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    pollingError$ = this.pollingErrorSubject$.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    pollingTimeout$ = this.pollingTimeoutSubject$.asObservable();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    form = this.fb.group({
        destination: ['', Validators.required],
        amount: [null as number, [Validators.required, Validators.pattern(/^\d+([,.]\d{1,2})?$/)]],
        currency: [null as StatSource, Validators.required],
    });

    constructor(
        private fistfulAdminService: FistfulAdminService,
        private fistfulStatisticsService: FistfulStatisticsService,
        private fb: FormBuilder,
        private idGenerator: UserInfoBasedIdGeneratorService,
        private configService: ConfigService,
        private fetchSourcesService: FetchSourcesService
    ) {
        this.initForm();
    }

    createDeposit() {
        this.create$.next();
    }

    private initForm() {
        this.fetchSourcesService.sources$.pipe(first()).subscribe((sources) => {
            this.form.patchValue({ currency: sources[0] });
        });
    }

    private getParams(): DepositParams {
        const { destination, amount, currency } = this.form.value;
        return {
            id: this.idGenerator.getUsernameBasedId(),
            source: currency.id,
            destination,
            body: {
                amount: toMinor(amount),
                currency: {
                    symbolic_code: currency.currency_symbolic_code,
                },
            },
        };
    }

    private getPollingParams(params: DepositParams): StatRequest {
        return depositParamsToRequest({
            fromTime: moment().startOf('d').toISOString(),
            toTime: moment().endOf('d').toISOString(),
            size: 1,
            depositId: params.id,
        });
    }
}
