import { Component, inject } from '@angular/core';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { SidenavInfoService } from '../../shared/components/sidenav-info';

import { PartyStoreService } from './party-store.service';

@Component({
    templateUrl: 'party.component.html',
    providers: [PartyStoreService],
    standalone: false,
})
export class PartyComponent {
    protected sidenavInfoService = inject(SidenavInfoService);
    private partyStoreService = inject(PartyStoreService);

    party$ = this.partyStoreService.party$;
    tags$ = this.party$.pipe(
        map((party) => [
            ...(party?.data?.block
                ? [
                      {
                          value: startCase(getUnionKey(party.data.block)),
                          color: getUnionKey(party.data.block) === 'blocked' ? 'warn' : 'success',
                      },
                  ]
                : []),
            ...(party?.data?.suspension
                ? [
                      {
                          value: startCase(getUnionKey(party.data.suspension)),
                          color:
                              getUnionKey(party.data.suspension) === 'suspended'
                                  ? 'warn'
                                  : 'success',
                      },
                  ]
                : []),
        ]),
    );
}
