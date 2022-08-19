import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'cc-add-ids-input',
    templateUrl: 'add-ids-input.component.html',
})
export class AddIdsInputComponent {
    @Input()
    disabled: boolean;
    @Output()
    add = new EventEmitter();

    idsControl = new UntypedFormControl('');

    emitAdd() {
        this.add.emit(this.execIdsFromStr(this.idsControl.value));
        this.idsControl.setValue('');
    }

    execIdsFromStr(str: string) {
        const ids: string[] = [];
        const selectIds = /[a-z0-9-/]+/gi;
        let execId = selectIds.exec(str);
        while (execId) {
            const id = execId[0];
            ids.push(id);
            execId = selectIds.exec(str);
        }
        return ids;
    }
}
