import {
    Component,
    DestroyRef,
    OnInit,
    booleanAttribute,
    computed,
    input,
    numberAttribute,
    output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';

import { NormColumn } from '../../types';

@Component({
    selector: 'v-table-info-bar',
    templateUrl: 'table-info-bar.component.html',
    styleUrl: 'table-info-bar.component.scss',
    standalone: false
})
export class TableInfoBarComponent<T extends object, C extends object> implements OnInit {
    progress = input(false, { transform: booleanAttribute });
    hasMore = input(false, { transform: booleanAttribute });
    hasLoad = input(false, { transform: booleanAttribute });
    isPreload = input(false, { transform: booleanAttribute });
    noDownload = input(false, { transform: booleanAttribute });
    noToolbar = input(false, { transform: booleanAttribute });
    dataProgress = input(false, { transform: booleanAttribute });
    columns = input<NormColumn<T, C>[]>([]);

    size = input(0, { transform: numberAttribute });
    preloadSize = input(0, { transform: numberAttribute });

    count = input<number | undefined | null>(undefined);
    filteredCount = input<number | undefined | null>(0);
    selectedCount = input<number | undefined | null>(0);

    filter = input<string>('');
    standaloneFilter = input(false, { transform: booleanAttribute });
    hasInputs = input(false, { transform: booleanAttribute });
    filterChange = output<string>();
    filterControl = new FormControl('', { nonNullable: true });

    downloadCsv = output();
    // eslint-disable-next-line @angular-eslint/no-output-native
    load = output();
    preload = output();

    countText = computed(() =>
        this.count()
            ? (this.filter() && this.filteredCount() !== this.count()
                  ? this.filteredCount() + '/'
                  : '') +
              (this.hasMore() ? '>' : '') +
              this.count()
            : this.progress() || this.count() !== 0
              ? '...'
              : '0',
    );

    constructor(private dr: DestroyRef) {}

    ngOnInit() {
        this.filterControl.valueChanges.pipe(takeUntilDestroyed(this.dr)).subscribe((v) => {
            this.filterChange.emit(v);
        });
    }

    // tune() {
    //     this.dialogService.open(CustomizeComponent, { columns: this.columns() });
    // }
}
