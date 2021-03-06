import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvoiceRepairScenario } from '@vality/domain-proto/lib/payment_processing';
import { RepairScenario } from '@vality/fistful-proto/lib/withdrawal_session';
import { KeycloakService } from 'keycloak-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { PaymentProcessingService } from '../thrift-services/damsel/payment-processing.service';
import { RepairerService } from '../thrift-services/fistful/repairer.service';
import { AutomatonService } from '../thrift-services/machinegun/automaton.service';
import { execute } from './execute';

@Injectable()
export class RepairingService {
    private _progress$: BehaviorSubject<number> = new BehaviorSubject(1);

    constructor(
        private snackBar: MatSnackBar,
        private keycloakService: KeycloakService,
        private automatonService: AutomatonService,
        private paymentProcessingService: PaymentProcessingService,
        private repairerService: RepairerService
    ) {}

    get progress$(): Observable<number> {
        return this._progress$;
    }

    get isLoading$(): Observable<boolean> {
        return this._progress$.pipe(map((progress) => progress !== 1));
    }

    combineIds(addedIds: string[], currentIds: string[] = []) {
        const ids: string[] = [];
        const alreadyAddedIds: string[] = [];
        for (const id of addedIds) {
            if (ids.includes(id) || currentIds.includes(id)) {
                if (!alreadyAddedIds.includes(id)) {
                    alreadyAddedIds.push(id);
                }
            } else {
                ids.push(id);
            }
        }
        if (alreadyAddedIds.length) {
            this.snackBar.open(`IDs: ${alreadyAddedIds.join(', ')} has already been added`, 'OK', {
                duration: 10000,
            });
        }
        return ids;
    }

    remove<E>(currentElements: E[], elements: E[]) {
        const resultDataSource = currentElements.slice();
        for (const element of elements) {
            resultDataSource.splice(
                resultDataSource.findIndex((e) => e === element),
                1
            );
        }
        return resultDataSource;
    }

    setStatus<E extends { status: S }, S>(elements: E[], status: S) {
        for (const element of elements) {
            element.status = status;
        }
    }

    executeGetMachine<E extends { id: string; ns: string }>(elements: E[]) {
        this._progress$.next(0);
        return execute(
            elements.map(
                ({ id, ns }) =>
                    () =>
                        this.automatonService.getMachine({
                            ns,
                            ref: { id },
                            range: { limit: 0, direction: 1 },
                        })
            )
        ).pipe(tap(({ progress }) => this._progress$.next(progress)));
    }

    executeSimpleRepair<E extends { id: string; ns: string }>(elements: E[]) {
        this._progress$.next(0);
        return execute(
            elements.map(
                ({ id, ns }) =>
                    () =>
                        this.automatonService.simpleRepair(ns, { id })
            )
        ).pipe(tap(({ progress }) => this._progress$.next(progress)));
    }

    executeRepairWithScenario<E extends { id: string }>(
        elements: E[],
        scenario: InvoiceRepairScenario
    ) {
        this._progress$.next(0);
        return execute(
            elements.map(
                ({ id }) =>
                    () =>
                        this.paymentProcessingService.repairWithScenario(id, scenario)
            )
        ).pipe(tap(({ progress }) => this._progress$.next(progress)));
    }

    executeRepair<E extends { id: string }>(elements: E[], scenario: RepairScenario) {
        this._progress$.next(0);
        return execute(
            elements.map(
                ({ id }) =>
                    () =>
                        this.repairerService.repair(id, scenario)
            )
        ).pipe(tap(({ progress }) => this._progress$.next(progress)));
    }
}
