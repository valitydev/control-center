import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mapTo, switchMap, take } from 'rxjs/operators';

import { DomainStoreService } from '../domain-store.service';
import { CreateTerminalParams, getCreateTerminalCommit } from '../operations';

@Injectable()
export class TerminalService {
    constructor(private domainStoreService: DomainStoreService) {}

    createTerminal(params: CreateTerminalParams): Observable<number> {
        return this.domainStoreService.getObjects('terminal').pipe(
            take(1),
            switchMap((terminalObjects) => {
                const { commit, id } = getCreateTerminalCommit(terminalObjects, params);
                return this.domainStoreService.commit(commit).pipe(mapTo(id));
            })
        );
    }
}
