import { formatDate } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ThriftAstMetadata, metadata$ } from '@vality/domain-proto';
import { PartyID, Reference, ShopID, base } from '@vality/domain-proto/domain';
import { ThriftData, ThriftViewExtension, isTypeWithAliases } from '@vality/ng-thrift';
import round from 'lodash-es/round';
import { Observable, of } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { ValuesType } from 'utility-types';

import { DomainObjectsStoreService } from '../../../../../../../../api/domain-config';
import { PartiesStoreService } from '../../../../../../../../api/payment-processing';
import { SidenavInfoService } from '../../../../../sidenav-info';
import { DomainObjectCardComponent } from '../../../../domain2';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private sidenavInfoService = inject(SidenavInfoService);
    private destroyRef = inject(DestroyRef);
    private partiesStoreService = inject(PartiesStoreService);

    extensions$: Observable<ThriftViewExtension[]> = metadata$.pipe(
        map((metadata): ThriftViewExtension[] => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'PartyID', 'domain')),
                extension: (_, partyId: PartyID) =>
                    this.partiesStoreService.getParty(partyId).value$.pipe(
                        map((p) => ({
                            value: p.data.contact_info.registration_email,
                            link: [[`/parties/${p.ref.id}`]] as Parameters<Router['navigate']>,
                            tooltip: p.ref.id,
                        })),
                        startWith({
                            value: String(partyId),
                            link: [[`/parties/${partyId}`]] as Parameters<Router['navigate']>,
                        }),
                    ),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
                extension: (_, shopId: ShopID) =>
                    this.partiesStoreService.getShop(shopId).value$.pipe(
                        map((p) => ({
                            value: p.data.name,
                            tooltip: shopId,
                            click: () => {
                                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                                    ref: { shop_config: { id: shopId } },
                                });
                            },
                        })),
                        startWith({
                            value: String(shopId),
                            click: () => {
                                this.sidenavInfoService.toggle(DomainObjectCardComponent, {
                                    ref: { shop_config: { id: shopId } },
                                });
                            },
                        }),
                    ),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: (_, value: base.Timestamp) =>
                    of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, 'Rational', 'base') &&
                            isTypeWithAliases(data.parent, 'CashVolumeShare', 'domain'),
                    ),
                extension: (_, value: base.Rational) =>
                    of({
                        value: `${round((value.p / value.q) * 100, 4)}%`,
                        tooltip: `${value.p}/${value.q}`,
                    }),
            },
        ]),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    createDomainObjectExtensions(
        metadata: ThriftAstMetadata[],
    ): ThriftViewExtension<ValuesType<Reference>>[] {
        const domainFields = new ThriftData<string, 'struct'>(metadata, 'domain', 'DomainObject')
            .ast;
        return domainFields.map((f) => {
            const objectFields = new ThriftData<string, 'struct'>(
                metadata,
                'domain',
                f.type as string,
            ).ast;
            const refType = objectFields.find((n) => n.name === 'ref').type as string;
            return {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, refType, 'domain') &&
                            !isTypeWithAliases(
                                data?.trueParent?.trueParent,
                                'DomainObject',
                                'domain',
                            ),
                    ),
                extension: (_, refId) => {
                    const ref = { [f.name]: refId };
                    return this.domainObjectsStoreService.getLimitedObject(ref).value$.pipe(
                        map((obj) => {
                            if (!obj) {
                                return undefined;
                            }
                            return {
                                value: obj.name,
                                tooltip: {
                                    description: obj.description,
                                    ref: refId,
                                },
                                click: () => {
                                    this.sidenavInfoService.toggle('domainObject', { ref });
                                },
                            };
                        }),
                    );
                },
            };
        });
    }
}
