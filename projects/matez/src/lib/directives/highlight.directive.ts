import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import {
    DestroyRef,
    Directive,
    ElementRef,
    Injector,
    OnInit,
    Renderer2,
    inject,
    input,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

import { SPACES } from '../components/table/utils/normalize-string';

@Directive({
    standalone: true,
    selector: '[vHighlight]',
})
export class HighlightDirective implements OnInit {
    private el = inject(ElementRef);
    private renderer = inject(Renderer2);
    private dr = inject(DestroyRef);
    private injector = inject(Injector);
    vHighlightText = input('', { transform: (v) => String(v || '') });
    vHighlightSearch = input('', { transform: (v) => String(v || '') });

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
