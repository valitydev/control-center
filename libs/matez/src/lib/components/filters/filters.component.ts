import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild,
    booleanAttribute,
    signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DialogService } from '../dialog';

import { FiltersDialogComponent } from './components/filters-dialog/filters-dialog.component';
import { MainFiltersDirective } from './components/main-filters/main-filters.directive';
import { OtherFiltersDirective } from './components/other-filters/other-filters.directive';

@Component({
    selector: 'v-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    standalone: false,
})
export class FiltersComponent {
    @Input() active = 0;
    @Input({ transform: booleanAttribute }) merge = false;
    // TODO: to change from outside you need to change the logic and set $rows in two SCSS
    rows = signal(1);

    @Output() clear = new EventEmitter<void>();

    @ContentChild(TemplateRef, { static: true }) filtersTemplate!: TemplateRef<unknown>;
    @ContentChild(OtherFiltersDirective, { static: true })
    otherFiltersDirective!: OtherFiltersDirective;
    @ContentChild(MainFiltersDirective, { static: true })
    mainFiltersDirective!: MainFiltersDirective;

    @ViewChild('content') set content(content: ElementRef<HTMLElement>) {
        this.filtersCount$.next(content?.nativeElement?.children?.length ?? 0);
    }

    get mainFiltersTemplate() {
        return this.mainFiltersDirective?.templateRef ?? this.filtersTemplate;
    }

    get otherFiltersTemplate() {
        return this.otherFiltersDirective?.templateRef;
    }

    repeat$ = this.breakpointObserver.observe(Object.values(Breakpoints)).pipe(
        map((b) => {
            if (b.breakpoints[Breakpoints.XLarge]) {
                return 5;
            }
            if (b.breakpoints[Breakpoints.Large]) {
                return 4;
            }
            if (b.breakpoints[Breakpoints.Medium]) {
                return 3;
            }
            if (b.breakpoints[Breakpoints.Small]) {
                return 2;
            }
            return 1;
        }),
    );

    displayedFiltersCount$ = combineLatest([this.repeat$, toObservable(this.rows)]).pipe(
        map(([repeat, rows]) => repeat * rows),
    );
    filtersCount$ = new BehaviorSubject(0);

    constructor(
        private dialog: DialogService,
        private breakpointObserver: BreakpointObserver,
    ) {}

    open() {
        this.dialog.open(FiltersDialogComponent, { filters: this });
    }
}
