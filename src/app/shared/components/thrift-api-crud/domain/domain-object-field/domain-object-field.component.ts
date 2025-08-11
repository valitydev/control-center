import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component, Input, booleanAttribute, inject, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DomainObjectType, Reference } from '@vality/domain-proto/domain';
import {
    FormControlSuperclass,
    Option,
    SelectFieldComponent,
    SelectFieldModule,
    createControlProviders,
} from '@vality/matez';

import { FetchDomainObjectsService } from '~/api/domain-config/services/fetch-domain-objects.service';

import { ReferenceId, getReferenceId } from '../utils/get-reference-id';

@Component({
    selector: 'cc-domain-object-field',
    templateUrl: './domain-object-field.component.html',
    providers: [
        ...createControlProviders(() => DomainObjectFieldComponent),
        FetchDomainObjectsService,
    ],
    imports: [SelectFieldModule, CommonModule, ReactiveFormsModule, FormsModule],
})
export class DomainObjectFieldComponent<T extends keyof Reference> extends FormControlSuperclass<
    ReferenceId | ReferenceId[]
> {
    private fetchDomainObjectsService = inject(FetchDomainObjectsService);

    @Input() name: T;
    @Input() label: string;
    @Input({ transform: booleanAttribute }) required: boolean;
    @Input() size?: SelectFieldComponent['size'];
    @Input() appearance?: SelectFieldComponent['appearance'];
    @Input() hint?: string;
    multiple = input(false, { transform: booleanAttribute });

    options$: Observable<Option<ReferenceId>[]> = this.fetchDomainObjectsService.result$.pipe(
        map((objs) =>
            objs.map((obj) => ({
                value: getReferenceId(obj.ref),
                label: obj.name || `#${getReferenceId(obj.ref)}`,
                description: obj.description,
            })),
        ),
    );
    progress$ = this.fetchDomainObjectsService.isLoading$;

    search(search: string) {
        this.fetchDomainObjectsService.load(
            { type: DomainObjectType[this.name], query: search },
            { size: 1000 },
        );
    }
}
