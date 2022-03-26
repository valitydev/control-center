import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Modification } from '@vality/domain-proto/lib/claim_management';
import { Observable } from 'rxjs';

import { EditUnsavedModificationComponent } from './edit-unsaved-modification/edit-unsaved-modification.component';
import { prepareModificationToEdit } from './prepare-modification-to-edit';

type PartyModificationPosition = number;

@Injectable()
export class EditClaimChangesetService {
    constructor(private dialog: MatDialog) {}

    edit(pos: PartyModificationPosition, mods: Modification[]): Observable<Modification[]> {
        const preparedModification = prepareModificationToEdit(mods[pos].party_modification);
        return new Observable((observer) => {
            const d = this.dialog.open(EditUnsavedModificationComponent, {
                disableClose: true,
                data: preparedModification,
                width: '800px',
            });
            d.afterClosed().subscribe((newMod) => {
                if (newMod) {
                    mods[pos] = newMod;
                }
                observer.next(mods);
            });
        });
    }
}
