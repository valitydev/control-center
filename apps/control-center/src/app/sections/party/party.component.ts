import { Component, inject } from '@angular/core';
import { Link } from '@vality/matez';
import { getUnionKey } from '@vality/ng-thrift';
import startCase from 'lodash-es/startCase';
import { map } from 'rxjs/operators';

import { SidenavInfoService } from '../../shared/components/sidenav-info';
import { Services } from '../../shared/services';

import { PartyStoreService } from './party-store.service';

interface PartyLink extends Link {
    services?: Services[];
}

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
            ...(party?.blocking
                ? [
                      {
                          value: startCase(getUnionKey(party.blocking)),
                          color: getUnionKey(party.blocking) === 'blocked' ? 'warn' : 'success',
                      },
                  ]
                : []),
            ...(party?.suspension
                ? [
                      {
                          value: startCase(getUnionKey(party.suspension)),
                          color: getUnionKey(party.suspension) === 'suspended' ? 'warn' : 'success',
                      },
                  ]
                : []),
        ]),
    );
}
