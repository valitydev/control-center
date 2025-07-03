import { formatDate } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ThriftAstMetadata, metadata$ } from '@vality/domain-proto';
import { DomainObject, PartyID, ShopID, base } from '@vality/domain-proto/domain';
import {
    ThriftData,
    ThriftViewExtension,
    getUnionValue,
    isTypeWithAliases,
} from '@vality/ng-thrift';
import isEqual from 'lodash-es/isEqual';
import round from 'lodash-es/round';
import { Observable, of } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../../../api/domain-config/stores/domain-store.service';
import { PartiesStoreService } from '../../../../../../../api/payment-processing';
import { ShopCardComponent } from '../../../../../shop-card/shop-card.component';
import { SidenavInfoService } from '../../../../../sidenav-info';
import { getDomainObjectDetails } from '../../../utils';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    private domainStoreService = inject(DomainStoreService);
    private sidenavInfoService = inject(SidenavInfoService);
    private destroyRef = inject(DestroyRef);
    private partiesStoreService = inject(PartiesStoreService);
    extensions$: Observable<ThriftViewExtension[]> = metadata$.pipe(
        map((metadata): ThriftViewExtension[] => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'PartyID', 'domain')),
                extension: (_, partyId: PartyID) =>
                    this.partiesStoreService.get(partyId).pipe(
                        map((p) => ({
                            value: p.contact_info.registration_email,
                            link: [[`/party/${p.id}`]] as Parameters<Router['navigate']>,
                            tooltip: p.id,
                        })),
                        startWith({
                            value: String(partyId),
                            link: [[`/party/${partyId}`]] as Parameters<Router['navigate']>,
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

    createShopExtension(partyId: PartyID): ThriftViewExtension {
        return {
            determinant: (data) => of(isTypeWithAliases(data, 'ShopID', 'domain')),
            extension: (_, shopId: ShopID) =>
                this.partiesStoreService.getShop(shopId, partyId).pipe(
                    map((p) => ({
                        value: p.details.name,
                        tooltip: shopId,
                        click: () => {
                            this.sidenavInfoService.toggle(ShopCardComponent, {
                                partyId,
                                id: shopId,
                            });
                        },
                    })),
                    startWith({
                        value: String(shopId),
                        click: () => {
                            this.sidenavInfoService.toggle(ShopCardComponent, {
                                partyId,
                                id: shopId,
                            });
                        },
                    }),
                ),
        };
    }

    createDomainObjectExtensions(metadata: ThriftAstMetadata[]): ThriftViewExtension[] {
        const domainFields = new ThriftData<string, 'struct'>(metadata, 'domain', 'DomainObject')
            .ast;
        return domainFields.map((f) => {
            const objectKey = f.name as keyof DomainObject;
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
                extension: (_, value) =>
                    this.domainStoreService.getObjectsRefs(objectKey).pipe(
                        map((refObjs) => refObjs.find(([, o]) => isEqual(o[objectKey].ref, value))),
                        map((refObj) => {
                            if (!refObj) {
                                return undefined;
                            }
                            const [ref, obj] = refObj;
                            const details = getDomainObjectDetails(obj);
                            return {
                                value: details.label,
                                tooltip: details.description
                                    ? {
                                          description: details.description,
                                          ref: getUnionValue(ref),
                                      }
                                    : { ref: getUnionValue(ref) },
                                click: () => {
                                    this.sidenavInfoService.toggle('domainObject', { ref });
                                },
                            };
                        }),
                    ),
            };
        });
    }
}
