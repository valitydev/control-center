import { inject } from '@angular/core';
import { Column, PossiblyAsync, getPossiblyAsyncObservable } from '@vality/ng-core';
import { combineLatest } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { DomainStoreService } from '../../../api/domain-config';
import { SidenavInfoService } from '../../components/sidenav-info';
import {
    DomainObjectCardComponent,
    getDomainObjectDetails,
} from '../../components/thrift-api-crud';

export function createProviderColumn<T extends object>(
    selectTerminalId: (d: T) => PossiblyAsync<number>,
): Column<T> {
    const domainStoreService = inject(DomainStoreService);
    const sidenavInfoService = inject(SidenavInfoService);
    return {
        field: 'provider',
        header: 'Provider',
        description: selectTerminalId,
        formatter: (d) =>
            combineLatest([
                getPossiblyAsyncObservable(selectTerminalId(d)),
                domainStoreService.getObjects('provider'),
            ]).pipe(
                map(
                    ([id, providers]) =>
                        getDomainObjectDetails({ provider: providers.find((t) => t.ref.id === id) })
                            .label,
                ),
            ),
        click: (d) => {
            getPossiblyAsyncObservable(selectTerminalId(d))
                .pipe(first())
                .subscribe((id) => {
                    sidenavInfoService.toggle(DomainObjectCardComponent, {
                        ref: { terminal: { id } },
                    });
                });
        },
    };
}
