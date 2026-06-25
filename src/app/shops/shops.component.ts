import { map, switchMap } from 'rxjs';

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { DomainObjectType } from '@vality/domain-proto/domain';
import { DebounceTime, DialogService, UpdateOptions } from '@vality/matez';

import { DomainObjectsStoreService, FetchFullDomainObjectsService } from '~/api/domain-config';
import { CreateDomainObjectDialogComponent } from '~/components/thrift-api-crud';
import { Blocking } from '@vality/domain-proto/domain';
import { ConfigService } from '~/services/config';

@Component({
    selector: 'cc-shops',
    templateUrl: './shops.component.html',
    providers: [FetchFullDomainObjectsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ShopsComponent implements OnInit {
    private fetchDomainObjectsService = inject(FetchFullDomainObjectsService);
    private domainObjectsStoreService = inject(DomainObjectsStoreService);
    private dialog = inject(DialogService);
    private configService = inject(ConfigService);

    shops$ = this.fetchDomainObjectsService.result$.pipe(
        map((res) => res.map((r) => ({ ...r.object.shop_config, info: r.info }))),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;
    hasMore$ = this.fetchDomainObjectsService.hasMore$;

    ngOnInit() {
        this.searchParamsUpdated('');
    }

    @DebounceTime()
    searchParamsUpdated(search: string) {
        this.fetchDomainObjectsService.load({
            query: search.trim(),
            type: DomainObjectType.shop_config,
        });
    }

    reload(options?: UpdateOptions) {
        this.fetchDomainObjectsService.reload(options);
    }

    more() {
        this.fetchDomainObjectsService.more();
    }

    create() {
        this.configService.config
            .getFirstValue()
            .pipe(
                switchMap((config) =>
                    this.dialog
                        .open(CreateDomainObjectDialogComponent<'shop_config'>, {
                            objectType: 'shop_config',
                            noType: true,
                            initValue: {
                                block: {
                                    unblocked: { reason: 'prod', since: new Date().toISOString() },
                                },
                                suspension: { active: { since: new Date().toISOString() } },
                                payment_institution: { id: config.default.paymentInstitution },
                                location: { url: 'none' },
                                category: { id: config.default.category },
                            },
                        })
                        .afterClosed(),
                ),
            )
            .subscribe((res) => {
                if (res?.status === 'success') {
                    this.reload();
                }
            });
    }
}
