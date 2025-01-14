import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

@Component({
    selector: 'v-no-records',
    template: `
        @if (noRecords()) {
            <div class="no-records mat-body-1">
                {{ progress() ? 'Loading...' : 'No records' }}
            </div>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [],
    styles: `
        .no-records {
            position: absolute;
            z-index: 999;
            top: calc(50% + (56px / 2));
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
        }
    `
})
export class NoRecordsComponent {
    noRecords = input(false, { transform: booleanAttribute });
    progress = input(false, { transform: booleanAttribute });
}
