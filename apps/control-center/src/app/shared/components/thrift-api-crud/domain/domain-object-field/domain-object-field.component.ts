import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DomainObject } from '@vality/domain-proto/internal/domain';
import {
    ComponentChanges,
    FormControlSuperclass,
    Option,
    SelectFieldModule,
    createControlProviders,
} from '@vality/matez';
import { ReplaySubject, defer, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DomainStoreService } from '../../../../../api/domain-config/stores/domain-store.service';
import { getDomainObjectValueDetailsFn } from '../utils';

type DomainObjectID = unknown;

@Component({
    selector: 'cc-domain-object-field',
    templateUrl: './domain-object-field.component.html',
    providers: createControlProviders(() => DomainObjectFieldComponent),
    imports: [CommonModule, ReactiveFormsModule, SelectFieldModule],
})
export class DomainObjectFieldComponent<T extends keyof DomainObject>
    extends FormControlSuperclass<DomainObjectID>
    implements OnChanges
{
    private domainStoreService = inject(DomainStoreService);
    @Input() name: T;

    options$ = defer(() => this.name$).pipe(
        switchMap((name) => this.domainStoreService.getObjects(name)),
        map((objs) => {
            const domainObjectToOption = getDomainObjectValueDetailsFn(this.name);
            return objs.map(domainObjectToOption).map(
                (o): Option<DomainObjectID> => ({
                    label: o.label,
                    value: o.id,
                    description: String(o.id),
                }),
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    isLoading$ = this.domainStoreService.isLoading$;

    private name$ = new ReplaySubject<keyof DomainObject>(1);

    override ngOnChanges(changes: ComponentChanges<DomainObjectFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.name) {
            this.name$.next(this.name);
        }
    }
}
