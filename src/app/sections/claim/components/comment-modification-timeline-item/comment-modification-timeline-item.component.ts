import { Component, Input, OnChanges } from '@angular/core';
import { CommentModification, ModificationUnit } from '@vality/domain-proto/lib/claim_management';
import { defer, ReplaySubject, switchMap, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, pluck, shareReplay } from 'rxjs/operators';

import { MessageService } from '@cc/app/api/messages';
import { ComponentChanges } from '@cc/app/shared';
import { NotificationService } from '@cc/app/shared/services/notification';
import { inProgressFrom, progressTo } from '@cc/utils/operators';

@Component({
    selector: 'cc-comment-modification-timeline-item',
    templateUrl: './comment-modification-timeline-item.component.html',
})
export class CommentModificationTimelineItemComponent implements OnChanges {
    @Input() modificationUnit: ModificationUnit;

    messages$ = defer(() => this.conversations$).pipe(pluck('conversations', 0, 'messages'));
    isLoading$ = inProgressFrom(() => this.progress$);

    messageMap: Record<keyof CommentModification, string> = {
        creation: 'added',
        changed: 'changed',
        deletion: 'removed',
    };
    iconMap: Record<keyof CommentModification, string> = {
        creation: 'add_comment',
        changed: 'add_comment',
        deletion: 'clear',
    };

    get commentModification() {
        return this.modificationUnit.modification.claim_modification.comment_modification;
    }

    private conversations$ = defer(() => this.modificationUnit$).pipe(
        switchMap(() =>
            this.messageService.GetConversations([this.commentModification.id], {}).pipe(
                catchError((err) => {
                    this.notificationService.error('Conversations were not loaded');
                    console.error(err);
                    return EMPTY;
                }),
                progressTo(this.progress$)
            )
        ),
        shareReplay({ refCount: true, bufferSize: 1 })
    );
    private modificationUnit$ = new ReplaySubject<ModificationUnit>(1);
    private progress$ = new BehaviorSubject(0);

    constructor(
        private messageService: MessageService,
        private notificationService: NotificationService
    ) {}

    ngOnChanges({ modificationUnit }: ComponentChanges<CommentModificationTimelineItemComponent>) {
        if (modificationUnit) {
            this.modificationUnit$.next(modificationUnit.currentValue);
        }
    }
}
