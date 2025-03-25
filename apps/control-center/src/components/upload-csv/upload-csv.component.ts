import { CommonModule } from '@angular/common';
import {
    Component,
    DestroyRef,
    EventEmitter,
    Injector,
    type OnInit,
    Output,
    computed,
    input,
    model,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import {
    Column,
    FileUploadModule,
    InputFieldModule,
    NotifyLogService,
    TableModule,
    createStorageValue,
    getValueChanges,
    loadFileContent,
    parseCsv,
    unifyCsvItems,
} from '@vality/matez';
import startCase from 'lodash-es/startCase';
import { BehaviorSubject, combineLatest, merge } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';

const DEFAULT_DELIMITER = ';';

export type CsvProps<R extends string = string, O extends string = string> = {
    required?: R[];
    optional?: O[];
};

export type CsvObject<R extends string = string, O extends string = string> = Record<R, string> &
    Partial<Record<O, string>>;

function getCsvObjectErrors<R extends string, O extends string>(
    props: CsvProps<R, O>,
    data: CsvObject<R, O>[],
): null | { required: R[] } {
    const needRequiredProps = new Set<R>();
    for (const item of data) {
        for (const p of props.required ?? []) {
            if (!(p in item)) {
                needRequiredProps.add(p);
            }
        }
    }
    return needRequiredProps.size ? { required: Array.from(needRequiredProps) } : null;
}

@Component({
    selector: 'cc-upload-csv',
    imports: [
        MatCheckbox,
        ReactiveFormsModule,
        MatAccordion,
        FileUploadModule,
        MatExpansionModule,
        TableModule,
        CommonModule,
        InputFieldModule,
    ],
    templateUrl: './upload-csv.component.html',
})
export class UploadCsvComponent<R extends string = string, O extends string = string>
    implements OnInit
{
    props = input<CsvProps<R, O>>({});
    formatDescription = input<string[]>();
    errors = input<Map<CsvProps<R, O>, { name?: string; message?: string }>>();

    selected = input<CsvObject<R, O>[], unknown>([], {
        transform: (v) => (v as CsvObject<R, O>[]) ?? [],
    });
    @Output() selectedChange = new EventEmitter<CsvObject<R, O>[]>();

    propsList = computed<string[]>(() => [
        ...(this.props().required ?? []),
        ...(this.props().optional ?? []),
    ]);
    selectedCsv = model<CsvObject<R, O>[]>([]);

    hasHeader = createStorageValue<boolean>('csv-has-header', {
        serialize: (v) => (v ? '1' : ''),
        deserialize: (v) => Boolean(v),
    });
    optionsForm = this.fb.group({
        hasHeader: this.hasHeader.value(),
        delimiter: '',
    });
    delimiter$ = getValueChanges(this.optionsForm.controls.delimiter).pipe(
        map((delimiter) => (delimiter as string) || DEFAULT_DELIMITER),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    upload$ = new BehaviorSubject<File | null>(null);
    data$ = combineLatest([this.upload$, getValueChanges(this.optionsForm)]).pipe(
        switchMap(([file]) => loadFileContent(file)),
        map((content) =>
            parseCsv(content, {
                header: this.optionsForm.value.hasHeader || false,
                delimiter: this.optionsForm.value.delimiter || undefined,
            }),
        ),
        tap((d) => {
            if (!d.errors.length) {
                return;
            }
            if (d.errors.length === 1) {
                this.log.error(d.errors[0]);
            }
            this.log.error(new Error(d.errors.map((e) => e.message).join('. ')));
        }),
        map((d) => {
            const data: CsvObject<R, O>[] = unifyCsvItems(d?.data, this.propsList());
            const errors = getCsvObjectErrors(this.props(), data);
            if (!errors) {
                return data;
            }
            this.log.error(
                `Missing required properties: ${errors.required.join(
                    ', ',
                )}. Perhaps you incorrectly checked the checkbox to have or not a header (the first element does not have at least an invoice ID).`,
            );
            return [];
        }),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    columns = computed<Column<CsvObject<R, O>>[]>(() => [
        ...this.propsList().map((p) => ({
            field: p,
            header: startCase(p),
        })),
        {
            field: 'error_code',
            cell: (d) => ({ value: this.errors()?.get(d)?.name }),
            hidden: !this.errors()?.size,
        },
        {
            field: 'error_message',
            cell: (d) => ({ value: this.errors()?.get(d)?.message }),
            hidden: !this.errors()?.size,
        },
    ]);

    constructor(
        private log: NotifyLogService,
        private dr: DestroyRef,
        private injector: Injector,
        private fb: NonNullableFormBuilder,
    ) {}

    ngOnInit() {
        merge(this.data$, toObservable(this.selected, { injector: this.injector }))
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((v) => {
                this.selectedCsv.set(v || []);
            });
        toObservable(this.selectedCsv, { injector: this.injector })
            .pipe(takeUntilDestroyed(this.dr))
            .subscribe((v) => {
                this.selectedChange.emit(v);
            });
        this.optionsForm.controls.hasHeader.valueChanges.subscribe((v) => {
            this.hasHeader.set(v);
        });
    }

    async loadFile(file?: File | null) {
        if (file) {
            this.upload$.next(file);
        }
    }
}
