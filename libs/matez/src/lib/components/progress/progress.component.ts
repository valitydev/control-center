import { Component, Input } from '@angular/core';

import { Progressable } from '../../types/progressable';

@Component({
    selector: 'v-progress',
    templateUrl: './progress.component.html',
    standalone: false
})
export class ProgressComponent implements Progressable {
    @Input() progress: Progressable['progress'];

    get mode() {
        return typeof this.progress === 'number' && this.progress <= 1 && this.progress > 0
            ? 'determinate'
            : !!this.progress || this.progress === ''
              ? 'indeterminate'
              : undefined;
    }

    get value(): number {
        return this.mode === 'determinate'
            ? Math.max(Math.min((1 - (this.progress as number)) * 100, 100), 0)
            : (undefined as never);
    }
}
