import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomainObject } from '@vality/domain-proto/internal/domain';
import { ComponentChanges } from '@vality/ng-core';
import { defer, switchMap, ReplaySubject } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';

import { DomainStoreService } from '@cc/app/api/deprecated-damsel';
import {
    DOMAIN_OBJECTS_TO_OPTIONS,
    OtherDomainObjects,
    defaultDomainObjectToOption,
} from '@cc/app/shared/services/domain-metadata-form-extensions/utils/domains-objects-to-options';
import { SelectSearchFieldModule } from '@cc/components/select-search-field';
import { ValidatedFormControlSuperclass, provideValueAccessor } from '@cc/utils';

@Component({
    standalone: true,
    selector: 'cc-domain-object-field',
    templateUrl: './domain-object-field.component.html',
    providers: [provideValueAccessor(() => DomainObjectFieldComponent)],
    imports: [CommonModule, SelectSearchFieldModule, ReactiveFormsModule],
})
export class DomainObjectFieldComponent<T extends keyof DomainObject>
    extends ValidatedFormControlSuperclass<DomainObject[T]>
    implements OnChanges
{
    @Input() name: T;

    control = new FormControl<DomainObject[T]>(null);

    options$ = defer(() => this.name$).pipe(
        switchMap((name) => this.domainStoreService.getObjects(name)),
        map((objs) => {
            const domainObjectToOption =
                this.name in DOMAIN_OBJECTS_TO_OPTIONS
                    ? DOMAIN_OBJECTS_TO_OPTIONS[this.name as keyof OtherDomainObjects]
                    : defaultDomainObjectToOption;
            return objs
                .map(domainObjectToOption)
                .map((o) => ({ ...o, description: `#${String(o.value)}` }));
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
