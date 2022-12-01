import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BaseDialogService, BaseDialogResponseStatus } from '@vality/ng-core';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, pluck, shareReplay, startWith, switchMap, take } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';

import { RoutingRulesType } from '../types/routing-rules-type';
import { AddPartyRoutingRuleDialogComponent } from './add-party-routing-rule-dialog';
import { InitializeRoutingRulesDialogComponent } from './initialize-routing-rules-dialog';
import { PartyRoutingRulesetService } from './party-routing-ruleset.service';

@UntilDestroy()
@Component({
    selector: 'cc-party-routing-ruleset',
    templateUrl: 'party-routing-ruleset.component.html',
    styleUrls: ['party-routing-ruleset.component.scss'],
    providers: [PartyRoutingRulesetService],
})
export class PartyRoutingRulesetComponent {
    partyRuleset$ = this.partyRoutingRulesetService.partyRuleset$;
    partyID$ = this.partyRoutingRulesetService.partyID$;
    routingRulesType$ = this.route.params.pipe(
        startWith(this.route.snapshot.params),
        pluck('type')
    ) as Observable<RoutingRulesType>;
    isLoading$ = this.domainStoreService.isLoading$;

    shopsDisplayedColumns = [
        { key: 'shop', name: 'Shop' },
        { key: 'id', name: 'Delegate (Ruleset Ref ID)' },
    ];
    walletsDisplayedColumns = [
        { key: 'wallet', name: 'Wallet' },
        { key: 'id', name: 'Delegate (Ruleset Ref ID)' },
    ];
    shopsData$ = combineLatest([this.partyRuleset$, this.partyRoutingRulesetService.shops$]).pipe(
        filter(([r]) => !!r),
        map(([ruleset, shops]) =>
            ruleset.data.decisions.delegates
                .filter((d) => d?.allowed?.condition?.party?.definition?.shop_is)
                .map((delegate, delegateIdx) => {
                    const shopId = delegate?.allowed?.condition?.party?.definition?.shop_is;
                    return {
                        parentRefId: ruleset.ref.id,
                        delegateIdx,
                        id: {
                            text: delegate?.description,
                            caption: delegate?.ruleset?.id,
                        },
                        shop: {
                            text: shops?.find((s) => s?.id === shopId)?.details?.name,
                            caption: shopId,
                        },
                    };
                })
        ),
        untilDestroyed(this),
        shareReplay(1)
    );
    walletsData$ = combineLatest([
        this.partyRuleset$,
        this.partyRoutingRulesetService.wallets$,
    ]).pipe(
        filter(([r]) => !!r),
        map(([ruleset, wallets]) =>
            ruleset.data.decisions.delegates
                .filter((d) => d?.allowed?.condition?.party?.definition?.wallet_is)
                .map((delegate, delegateIdx) => {
                    const walletId = delegate?.allowed?.condition?.party?.definition?.wallet_is;
                    return {
                        parentRefId: ruleset.ref.id,
                        delegateIdx,
                        id: {
                            text: delegate?.description,
                            caption: delegate?.ruleset?.id,
                        },
                        wallet: {
                            text: wallets?.find((w) => w?.id === walletId)?.name,
                            caption: walletId,
                        },
                    };
                })
        ),
        untilDestroyed(this),
        shareReplay(1)
    );

    constructor(
        private baseDialogService: BaseDialogService,
        private partyRoutingRulesetService: PartyRoutingRulesetService,
        private router: Router,
        private route: ActivatedRoute,
        private domainStoreService: DomainStoreService
    ) {}

    initialize() {
        combineLatest([
            this.partyRoutingRulesetService.partyID$,
            this.partyRoutingRulesetService.refID$,
        ])
            .pipe(
                take(1),
                switchMap(([partyID, refID]) =>
                    this.baseDialogService
                        .open(InitializeRoutingRulesDialogComponent, { partyID, refID })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe({
                next: () => {
                    this.partyRoutingRulesetService.reload();
                },
            });
    }

    addPartyRule() {
        combineLatest([
            this.partyRoutingRulesetService.refID$,
            this.partyRoutingRulesetService.shops$,
            this.partyRoutingRulesetService.wallets$,
            this.routingRulesType$,
            this.partyRoutingRulesetService.partyID$,
        ])
            .pipe(
                take(1),
                switchMap(([refID, shops, wallets, type, partyID]) =>
                    this.baseDialogService
                        .open(AddPartyRoutingRuleDialogComponent, {
                            refID,
                            shops,
                            wallets,
                            type,
                            partyID,
                        })
                        .afterClosed()
                ),
                untilDestroyed(this)
            )
            .subscribe({
                next: (res) => {
                    if (res.status === BaseDialogResponseStatus.Success) {
                        this.partyRoutingRulesetService.reload();
                    }
                },
            });
    }

    navigateToDelegate(parentRefId: number, delegateIdx: number) {
        this.partyRoutingRulesetService.partyRuleset$
            .pipe(take(1), untilDestroyed(this))
            .subscribe((ruleset) =>
                this.router.navigate([
                    'party',
                    this.route.snapshot.params.partyID,
                    'routing-rules',
                    this.route.snapshot.params.type,
                    parentRefId,
                    'delegate',
                    ruleset?.data?.decisions?.delegates?.[delegateIdx]?.ruleset?.id,
                ])
            );
    }
}
