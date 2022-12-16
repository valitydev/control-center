import { Injectable } from '@angular/core';
import { PartyModification } from '@vality/domain-proto/claim_management';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class PartyModificationEmitter {
    private modificationCreated$: Subject<PartyModification> = new Subject();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    modification$: Observable<PartyModification> = this.modificationCreated$.asObservable();

    modificationCreated(modification: PartyModification) {
        this.modificationCreated$.next(modification);
    }
}
