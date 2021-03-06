import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Modification } from '@vality/domain-proto/lib/claim_management';
import { ConversationId, User } from '@vality/messages-proto';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { catchError, filter, shareReplay, switchMap, tap } from 'rxjs/operators';
import * as uuid from 'uuid/v4';

import { progress } from '@cc/app/shared/custom-operators';

import { KeycloakTokenInfoService } from '../../../../keycloak-token-info.service';
import { MessagesService } from '../../../../thrift-services/messages/messages.service';
import { createSingleMessageConversationParams } from '../../../../thrift-services/messages/utils';
import { UnsavedClaimChangesetService } from '../../changeset/unsaved-changeset/unsaved-claim-changeset.service';

@Injectable()
export class SendCommentService {
    private hasError$ = new Subject<void>();
    private sendComment$ = new Subject<void>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    form = this.fb.group({
        comment: ['', [Validators.maxLength(1000), Validators.required]],
    });

    // eslint-disable-next-line @typescript-eslint/member-ordering
    comment$ = this.sendComment$.pipe(
        tap(() => this.hasError$.next()),
        switchMap(() => {
            const text = this.form.value.comment;
            const { name, email, sub } = this.keycloakTokenInfoService.decodedUserToken;
            const user: User = { fullname: name, email, user_id: sub };
            const conversationId = uuid();
            const conversation = createSingleMessageConversationParams(conversationId, text, sub);
            return forkJoin([
                of(conversationId),
                this.messagesService.saveConversations([conversation], user).pipe(
                    catchError((e) => {
                        console.error(e);
                        this.snackBar.open(`There was an error when sending the message.`, 'OK', {
                            duration: 5000,
                        });
                        this.hasError$.next(e);
                        return of('error');
                    })
                ),
            ]);
        }),
        tap(([conversationID]) =>
            this.unsavedClaimChangesetService.addModification(
                this.createModification(conversationID)
            )
        ),
        filter(([, result]) => result !== 'error'),
        shareReplay(1)
    );

    // eslint-disable-next-line @typescript-eslint/member-ordering
    inProgress$ = progress(this.sendComment$, merge(this.comment$, this.hasError$));

    constructor(
        private fb: UntypedFormBuilder,
        private messagesService: MessagesService,
        private keycloakTokenInfoService: KeycloakTokenInfoService,
        private snackBar: MatSnackBar,
        private unsavedClaimChangesetService: UnsavedClaimChangesetService
    ) {
        this.inProgress$.subscribe((inProgress) => {
            if (inProgress) {
                this.form.controls.comment.disable();
            } else {
                this.form.controls.comment.enable();
            }
        });

        this.comment$.subscribe(() => {
            this.form.reset();
        });
    }

    sendComment() {
        this.sendComment$.next();
    }

    private createModification(id: ConversationId): Modification {
        return {
            claim_modification: {
                comment_modification: {
                    id,
                    modification: {
                        creation: {},
                    },
                },
            },
        };
    }
}
