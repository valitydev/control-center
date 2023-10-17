import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TerminalObject } from '@vality/domain-proto/domain';
import { Column } from '@vality/ng-core';
import Fuse from 'fuse.js';
import { combineLatest } from 'rxjs';
import { startWith, map, debounceTime } from 'rxjs/operators';

import { objectToJSON } from '../../../utils';
import { DomainStoreService } from '../../api/deprecated-damsel';

@Component({
    selector: 'cc-terminals',
    templateUrl: './terminals.component.html',
})
export class TerminalsComponent {
    searchControl = new FormControl('');
    columns: Column<TerminalObject>[] = [
        { field: 'ref.id', sortable: true },
        { field: 'data.name', description: 'data.description', sortable: true },
        { field: 'data.provider_ref.id', header: 'Provider', sortable: true },
    ];
    data$ = combineLatest([
        this.domainStoreService.getObjects('terminal'),
        this.domainStoreService.getObjects('terminal').pipe(
            map((objects) => {
                const search = new Fuse(
                    objects.map((o) => ({
                        ref: o.ref.id,
                        data: JSON.stringify(objectToJSON(o.data)),
                        name: o.data.name,
                        description: o.data.description,
                    })),
                    { includeScore: true, keys: ['ref', 'name', 'description', 'data'] },
                );
                return search;
            }),
        ),
        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            debounceTime(100),
        ),
    ]).pipe(
        map(([terminals, terminalsSearch, search]) =>
            search ? terminalsSearch.search(search).map((r) => terminals[r.refIndex]) : terminals,
        ),
    );
    progress$ = this.domainStoreService.isLoading$;

    constructor(private domainStoreService: DomainStoreService) {}

    update() {
        this.domainStoreService.forceReload();
    }

    create() {}
}
