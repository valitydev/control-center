import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { KeycloakTokenInfoService } from '@cc/app/shared/services';

import { toListValueType } from '../../../thrift-services';
import { ThriftConnector } from '../../thrift-connector';
import {
    CashRegisterProvider,
    Category,
    ContractTemplate,
    Country,
    TradeBloc,
} from '../gen-model/dominant_cache';
import { DominantCacheInstanceProvider } from './dominant-cache-instance-provider.service';
import * as DominantCache from './gen-nodejs/DominantCache';

@Injectable({ providedIn: 'root' })
export class DominantCacheService extends ThriftConnector {
    constructor(
        protected keycloakTokenInfoService: KeycloakTokenInfoService,
        private instanceProvider: DominantCacheInstanceProvider
    ) {
        super(keycloakTokenInfoService, DominantCache, '/v1/dominant/cache');
    }

    getCategories(): Observable<Category[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<Category[]>('GetCategories').pipe(
                    map((v) => toPlainObject(toListValueType('Category'), v))
                )
            )
        );
    }

    getDocumentTypes(): Observable<DocumentType[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<DocumentType[]>('GetDocumentTypes').pipe(
                    map((v) => toPlainObject(toListValueType('DocumentType'), v))
                )
            )
        );
    }

    getCashRegisterProviders(): Observable<CashRegisterProvider[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<CashRegisterProvider[]>(
                    'GetCashRegisterProviders'
                ).pipe(map((v) => toPlainObject(toListValueType('CashRegisterProvider'), v)))
            )
        );
    }

    getContractTemplates(): Observable<ContractTemplate[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<ContractTemplate[]>('GetContractTemplates').pipe(
                    map((v) => toPlainObject(toListValueType('ContractTemplate'), v))
                )
            )
        );
    }

    getTradeBlocs(): Observable<TradeBloc[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<TradeBloc[]>('GetTradeBlocs').pipe(
                    map((v) => toPlainObject(toListValueType('TradeBloc'), v))
                )
            )
        );
    }

    getCountries(): Observable<Country[]> {
        return this.instanceProvider.methods$.pipe(
            switchMap(({ toPlainObject }) =>
                this.callThriftServiceMethod<Country[]>('GetCountries').pipe(
                    map((v) => toPlainObject(toListValueType('Country'), v))
                )
            )
        );
    }
}
