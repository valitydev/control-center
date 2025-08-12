import { filter } from 'rxjs/operators';

import {
    DestroyRef,
    Directive,
    ElementRef,
    OnInit,
    booleanAttribute,
    inject,
    input,
    output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { createIntersectionObserver } from '../utils/create-intersection-observer';

@Directive({
    selector: '[vInfinityScroll]',
    standalone: true,
})
export class InfinityScrollDirective implements OnInit {
    private elementRef = inject(ElementRef);
    private dr = inject(DestroyRef);
    vInfinityScroll = input(false, { transform: booleanAttribute });
    vInfinityScrollMore = output();

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
