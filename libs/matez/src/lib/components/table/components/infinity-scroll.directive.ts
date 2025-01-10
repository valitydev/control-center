import {
    DestroyRef,
    Directive,
    ElementRef,
    OnInit,
    booleanAttribute,
    input,
    output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { createIntersectionObserver } from '../utils/create-intersection-observer';

@Directive({
    selector: '[vInfinityScroll]',
    standalone: true,
})
export class InfinityScrollDirective implements OnInit {
    vInfinityScroll = input(false, { transform: booleanAttribute });
    vInfinityScrollMore = output();

    constructor(
        private elementRef: ElementRef,
        private dr: DestroyRef,
    ) {}

    ngOnInit() {
        createIntersectionObserver(this.elementRef.nativeElement)
            .pipe(
                filter(() => this.vInfinityScroll()),
                takeUntilDestroyed(this.dr),
            )
            .subscribe(() => {
                this.vInfinityScrollMore.emit();
            });
    }
}
