import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TerminalObject } from '@vality/domain-proto/domain';
import { Column } from '@vality/ng-core';
import { combineLatest } from 'rxjs';
import { startWith, map, debounceTime, tap } from 'rxjs/operators';

import { objectToJSON, createFullTextSearch } from '../../../utils';
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
        this.domainStoreService.getObjects('terminal').pipe(
            map((objects) =>
                createFullTextSearch(
                    objects,
                    objects.map((o) => ({
                        ref: o.ref.id,
                        data: JSON.stringify(objectToJSON(o.data)),
                        name: o.data.name,
                        description: o.data.description,
                    })),
                ),
            ),
        ),
        this.searchControl.valueChanges.pipe(
            startWith(this.searchControl.value),
            debounceTime(100),
        ),
    ]).pipe(
        tap(([, search]) => {
            if (search) {
                this.sort = { active: '', direction: '' };
            }
        }),
        map(([fts, search]) => fts.search(search)),
    );
    progress$ = this.domainStoreService.isLoading$;
    sort: Sort = { active: 'data.name', direction: 'asc' };

    constructor(
        private domainStoreService: DomainStoreService,
        private router: Router,
    ) {}

    update() {
        this.domainStoreService.forceReload();
    }

    create() {
        void this.router.navigate(['/domain/create']);
    }
}
