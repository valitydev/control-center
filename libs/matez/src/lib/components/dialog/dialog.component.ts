import {
    Component,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    booleanAttribute,
} from '@angular/core';

import { Progressable } from '../../types/progressable';

import { DialogResponseStatus } from './types/dialog-response-status';

@Component({
    selector: 'v-dialog',
    templateUrl: 'dialog.component.html',
    styleUrls: ['dialog.component.scss'],
    standalone: false
})
export class DialogComponent implements Progressable {
    @HostBinding('class.v-dialog') hostClass: boolean = true;

    @Input() title!: string;

    @Input({ transform: booleanAttribute }) disabled: boolean = false;
    @Input() progress?: Progressable['progress'];

    @Input({ transform: booleanAttribute }) hasDivider: boolean = true;

    @Input({ transform: booleanAttribute }) noContent: boolean = false;
    @Input({ transform: booleanAttribute }) noActions: boolean = false;
    @Input({ transform: booleanAttribute }) noCloseButton: boolean = false;

    @Input({ transform: booleanAttribute }) fullSize: boolean = false;

    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() cancel = new EventEmitter<void>();

    cancelData = {
        status: DialogResponseStatus.Cancelled,
    };

    cancelDialog(): void {
        this.cancel.emit();
    }
}
