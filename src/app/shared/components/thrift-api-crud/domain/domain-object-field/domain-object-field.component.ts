import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DomainObject } from '@vality/domain-proto/internal/domain';
import {
    ComponentChanges,
    FormControlSuperclass,
    createControlProviders,
    SelectFieldModule,
    Option,
} from '@vality/ng-core';
import { defer, switchMap, ReplaySubject } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/domain-config';

import {
    DOMAIN_OBJECTS_TO_OPTIONS,
    OtherDomainObjects,
    defaultDomainObjectToOption,
} from '../../../../services/domain-metadata-form-extensions/utils/domains-objects-to-options';

type DomainObjectID = unknown;

@Component({
    standalone: true,
    selector: 'cc-domain-object-field',
    templateUrl: './domain-object-field.component.html',
    providers: createControlProviders(() => DomainObjectFieldComponent),
    imports: [CommonModule, ReactiveFormsModule, SelectFieldModule],
})
export class DomainObjectFieldComponent<T extends keyof DomainObject>
    extends FormControlSuperclass<DomainObjectID>
    implements OnChanges
{
    @Input() name: T;

    options$ = defer(() => this.name$).pipe(
        switchMap((name) => this.domainStoreService.getObjects(name)),
        map((objs) => {
            const domainObjectToOption =
                this.name in DOMAIN_OBJECTS_TO_OPTIONS
                    ? DOMAIN_OBJECTS_TO_OPTIONS[this.name as keyof OtherDomainObjects]
                    : defaultDomainObjectToOption;
            return objs.map(domainObjectToOption).map(
                (o): Option<DomainObjectID> => ({
                    label: o.label,
                    value: o.value,
                    description: String(o.value),
                }),
            );
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    isLoading$ = this.domainStoreService.isLoading$;

    private name$ = new ReplaySubject<keyof DomainObject>(1);

    constructor(private domainStoreService: DomainStoreService) {
        super();
    }

    ngOnChanges(changes: ComponentChanges<DomainObjectFieldComponent<T>>) {
        super.ngOnChanges(changes);
        if (changes.name) {
            this.name$.next(this.name);
        }
    }
}
