import { Component, Input, OnChanges } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ReplaySubject } from 'rxjs';

import { objectToJSON } from '../../../api/utils';
import { toMonacoFile } from '../../../domain/utils';
import { ComponentChanges } from '../../utils';

enum Kind {
    Diff = 'diff',
}

@UntilDestroy()
@Component({
    selector: 'cc-thrift-viewer',
    templateUrl: './thrift-viewer.component.html',
    styleUrls: ['./thrift-viewer.component.scss'],
})
export class ThriftViewerComponent<T> implements OnChanges {
    @Input() kind: Kind = Kind.Diff;
    @Input() value: T;
    @Input() compared?: T;

    valueFile$ = new ReplaySubject(1);
    comparedFile$ = new ReplaySubject(1);

    ngOnChanges(changes: ComponentChanges<ThriftViewerComponent<T>>) {
        if (changes.value) {
            this.valueFile$.next(toMonacoFile(JSON.stringify(objectToJSON(this.value), null, 2)));
        }
        if (changes.compared) {
            this.comparedFile$.next(
                toMonacoFile(JSON.stringify(objectToJSON(this.compared), null, 2))
            );
        }
    }
}
