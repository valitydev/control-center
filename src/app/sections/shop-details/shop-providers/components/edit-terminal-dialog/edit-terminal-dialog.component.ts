import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PartyID, ShopID } from '@vality/domain-proto';
import { TerminalID } from '@vality/fistful-proto';

import { EditTerminalDecisionPropertyForShopService } from '../../../../../thrift-services/damsel';
import { EditTerminalDialogResponse, TerminalActionTypes } from '../../types';

@Component({
    templateUrl: 'edit-terminal-dialog.component.html',
    providers: [EditTerminalDecisionPropertyForShopService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTerminalDialogComponent {
    editValueControl = new UntypedFormControl('', [Validators.required]);
    terminalActionTypes = TerminalActionTypes;
    inProgress$ = this.editTerminalDecisionPropertyForShopService.inProgress$;

    constructor(
        private editTerminalDecisionPropertyForShopService: EditTerminalDecisionPropertyForShopService,
        public dialogRef: MatDialogRef<EditTerminalDialogComponent, EditTerminalDialogResponse>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            type: TerminalActionTypes;
            terminalID: TerminalID;
            providerID: number;
            shopID: ShopID;
            partyID: PartyID;
        }
    ) {
        this.editTerminalDecisionPropertyForShopService.edited$.subscribe(() =>
            this.dialogRef.close('edited')
        );
        this.editTerminalDecisionPropertyForShopService.inProgress$.subscribe((progress) => {
            if (progress) {
                this.editValueControl.disable();
            } else {
                this.editValueControl.enable();
            }
        });
    }

    save() {
        const editParams = {
            providerID: this.data.providerID,
            terminalID: this.data.terminalID,
            partyID: this.data.partyID,
            shopID: this.data.shopID,
            value: this.editValueControl.value,
        };
        switch (this.data.type) {
            case TerminalActionTypes.EditWeight:
                this.editTerminalDecisionPropertyForShopService.editTerminalDecisionPropertyForShop(
                    {
                        ...editParams,
                        property: 'weight',
                    }
                );
                break;
            case TerminalActionTypes.EditPriority:
                this.editTerminalDecisionPropertyForShopService.editTerminalDecisionPropertyForShop(
                    {
                        ...editParams,
                        property: 'priority',
                    }
                );
                break;
            default:
                console.error('Wrong terminal action!');
        }
    }
}
