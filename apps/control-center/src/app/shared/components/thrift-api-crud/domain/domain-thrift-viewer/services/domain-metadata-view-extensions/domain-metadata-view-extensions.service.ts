import { formatDate } from '@angular/common';
import { Injectable, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThriftAstMetadata } from '@vality/domain-proto';
import { DomainObject } from '@vality/domain-proto/domain';
import { Rational, Timestamp } from '@vality/domain-proto/internal/base';
import { PartyID, ShopID } from '@vality/domain-proto/internal/domain';
import { getImportValue } from '@vality/matez';
import { getUnionValue, isTypeWithAliases, ThriftData } from '@vality/ng-thrift';
import isEqual from 'lodash-es/isEqual';
import round from 'lodash-es/round';
import { of, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../../../api/domain-config/stores/domain-store.service';
import { PartiesStoreService } from '../../../../../../../api/payment-processing';
import { MetadataViewExtension } from '../../../../../json-viewer/utils/metadata-view-extension';
import { ShopCardComponent } from '../../../../../shop-card/shop-card.component';
import { SidenavInfoService } from '../../../../../sidenav-info';
import { getDomainObjectDetails } from '../../../utils';

@Injectable({
    providedIn: 'root',
})
export class DomainMetadataViewExtensionsService {
    extensions$: Observable<MetadataViewExtension[]> = getImportValue<ThriftAstMetadata[]>(
        import('@vality/domain-proto/metadata.json'),
    ).pipe(
        map((metadata): MetadataViewExtension[] => [
            ...this.createDomainObjectExtensions(metadata),
            {
                determinant: (data) => of(isTypeWithAliases(data, 'PartyID', 'domain')),
                extension: (_, partyId: PartyID) =>
                    this.partiesStoreService.get(partyId).pipe(
                        map((p) => ({
                            value: p.contact_info.registration_email,
                            link: [[`/party/${p.id}`]],
                            tooltip: p.id,
                        })),
                    ),
            },
            {
                determinant: (data) => of(isTypeWithAliases(data, 'Timestamp', 'base')),
                extension: (_, value: Timestamp) =>
                    of({ value: formatDate(value, 'dd.MM.yyyy HH:mm:ss', 'en') }),
            },
            {
                determinant: (data) =>
                    of(
                        isTypeWithAliases(data, 'Rational', 'base') &&
                            isTypeWithAliases(data.parent, 'CashVolumeShare', 'domain'),
                    ),
                extension: (_, value: Rational) =>
                    of({
                        value: `${round((value.p / value.q) * 100, 4)}%`,
                        tooltip: `${value.p}/${value.q}`,
                    }),
            },
        ]),
        takeUntilDestroyed(this.destroyRef),
        shareReplay(1),
    );

    constructor(
        private domainStoreService: DomainStoreService,
        private sidenavInfoService: SidenavInfoService,
        private destroyRef: DestroyRef,
        private partiesStoreService: PartiesStoreService,
    ) {}

    createShopExtension(partyId: PartyID): MetadataViewExtension {
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
                ),
        };
    }

    createDomainObjectExtensions(metadata: ThriftAstMetadata[]): MetadataViewExtension[] {
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
