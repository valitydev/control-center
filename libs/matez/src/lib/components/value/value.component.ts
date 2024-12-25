import { CommonModule } from '@angular/common';
import {
    Component,
    booleanAttribute,
    runInInjectionContext,
    Injector,
    ChangeDetectionStrategy,
    Input,
    input,
    model,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { combineLatest, switchMap, of, isObservable, Observable } from 'rxjs';
import { map, shareReplay, first, filter } from 'rxjs/operators';

import { HighlightDirective } from '../../directives';
import { Nil } from '../../utils';
import { ContentLoadingComponent } from '../content-loading';
import { TagModule } from '../tag';

import { MenuValueComponent } from './components/menu-value.component';
import { Value } from './types/value';
import { valueToString } from './utils/value-to-string';

@Component({
    selector: 'v-value',
    standalone: true,
    imports: [
        CommonModule,
        MatIcon,
        MatIconButton,
        TagModule,
        MatTooltip,
        MenuValueComponent,
        ContentLoadingComponent,
        HighlightDirective,
    ],
    templateUrl: './value.component.html',
    styleUrl: './value.component.scss',
    host: {
        '[class.inline]': 'inline',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueComponent {
    value = input<Value | Nil>();
    lazyValue = input<Observable<Value> | Nil>();
    lazyVisible = model<boolean>(false);

    progress = input(false, { transform: booleanAttribute });
    @Input({ transform: booleanAttribute }) inline = false;
    @Input({
        transform: (v: unknown): string => (v === false ? '' : typeof v === 'string' ? v : '―'),
    })
    emptySymbol = '―';

    @Input() highlight?: string | null;

    value$ = combineLatest([toObservable(this.value), toObservable(this.lazyValue)]).pipe(
        switchMap(([value, lazyValue]) => (isObservable(lazyValue) ? lazyValue : of(value))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    valueText$ = this.value$.pipe(
        map((value) => runInInjectionContext(this.injector, () => valueToString(value))),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    inProgress$ = combineLatest([
        toObservable(this.progress),
        this.value$.pipe(map((v) => v?.inProgress ?? false)),
    ]).pipe(
        map(([compProgress, valueProgress]) => compProgress || valueProgress),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(
        private injector: Injector,
        private router: Router,
    ) {}

    makeLazyVisible() {
        this.lazyVisible.set(true);
    }

    click(event: MouseEvent) {
        this.value$.pipe(first(), filter(Boolean)).subscribe((value) => {
            runInInjectionContext(this.injector, () => {
                if (value?.click) {
                    value.click(event);
                } else if (typeof value?.link === 'function') {
                    const linkArgs = value.link(event);
                    if (typeof linkArgs === 'string') {
                        this.router.navigateByUrl(linkArgs);
                        return;
                    }
                    this.router.navigate(...linkArgs);
                }
            });
        });
    }
}
