import {
    Directive,
    ElementRef,
    OnInit,
    input,
    Injector,
    DestroyRef,
    Renderer2,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { SPACES } from '../components/table/utils/normalize-string';

@Directive({
    standalone: true,
    selector: '[vHighlight]',
})
export class HighlightDirective implements OnInit {
    vHighlightText = input('', { transform: (v) => String(v || '') });
    vHighlightSearch = input('', { transform: (v) => String(v || '') });

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private dr: DestroyRef,
        private injector: Injector,
    ) {}

    ngOnInit() {
        combineLatest([
            toObservable(this.vHighlightText, { injector: this.injector }).pipe(
                distinctUntilChanged(),
                map((text) => this.escapeHtml(text)),
            ),
            toObservable(this.vHighlightSearch, { injector: this.injector }).pipe(
                distinctUntilChanged(),
                map((text) => this.escapeHtml(text)),
            ),
        ])
            .pipe(
                map(([text, search]) => {
                    if (!search) {
                        return text;
                    }
                    const re = new RegExp(`(${search.replace(SPACES, '\\s')})`, 'gi');
                    return text.replace(re, `<mark>$1</mark>`);
                }),
                distinctUntilChanged(),
                takeUntilDestroyed(this.dr),
            )
            .subscribe((text) => {
                this.renderer.setProperty(this.el.nativeElement, 'innerHTML', text);
            });
    }

    private escapeHtml(html: string): string {
        return html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
