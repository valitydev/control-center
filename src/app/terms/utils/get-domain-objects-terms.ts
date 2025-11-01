import { uniqBy } from 'lodash-es';
import { map, of } from 'rxjs';

import { inject } from '@angular/core';

import { DomainObjectType, ShopConfig, WalletConfig } from '@vality/domain-proto/domain';
import { VersionedObject } from '@vality/domain-proto/domain_config_v2';
import { pagedObservableResource, switchCombineWith } from '@vality/matez';
import { getUnionValue } from '@vality/ng-thrift';

import { ThriftRepositoryClientService, ThriftRepositoryService } from '~/api/services';

export interface DomainObjectTerms {
    object: VersionedObject;
    terms: VersionedObject;
}

export function getDomainObjectsTerms(
    type: DomainObjectType.shop_config | DomainObjectType.wallet_config,
) {
    const repositoryService = inject(ThriftRepositoryService);
    const repositoryClientService = inject(ThriftRepositoryClientService);

    return pagedObservableResource<DomainObjectTerms, void>({
        params: null,
        loader: (_, { continuationToken, size }) =>
            repositoryService
                .SearchFullObjects({
                    query: '*',
                    type,
                    continuation_token: continuationToken,
                    limit: size,
                })
                .pipe(
                    switchCombineWith(({ result }) => {
                        const termsObjectRefs = uniqBy(
                            result
                                .map(
                                    (obj) =>
                                        (
                                            getUnionValue(obj.object).data as
                                                | ShopConfig
                                                | WalletConfig
                                        ).terms,
                                )
                                .filter(Boolean),
                            'id',
                        ).map((ref) => ({ term_set_hierarchy: ref }));
                        return [
                            termsObjectRefs.length
                                ? repositoryClientService.CheckoutObjects(
                                      { head: {} },
                                      termsObjectRefs,
                                  )
                                : of([] as VersionedObject[]),
                        ];
                    }),
                    map(([result, termsObjs]) => ({
                        result: result.result.map((obj) => {
                            const termsId = (
                                getUnionValue(obj.object).data as ShopConfig | WalletConfig
                            ).terms?.id;
                            return {
                                object: obj,
                                terms: termsObjs.find(
                                    (termsObj) =>
                                        termsObj.object.term_set_hierarchy.ref.id === termsId,
                                ),
                            };
                        }),
                        continuationToken: result.continuation_token,
                    })),
                ),
    });
}
