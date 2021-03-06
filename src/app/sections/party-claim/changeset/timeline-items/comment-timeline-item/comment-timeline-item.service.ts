import { Injectable } from '@angular/core';
import { ConversationId } from '@vality/messages-proto';
import { merge, of, Subject } from 'rxjs';
import { catchError, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { progress } from '@cc/app/shared/custom-operators';

import { MessagesService } from '../../../../../thrift-services/messages/messages.service';

@Injectable()
export class CommentTimelineItemService {
    private getConversations$ = new Subject<ConversationId[]>();
    private hasError$ = new Subject<string>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    message$ = this.getConversations$.pipe(
        switchMap((conversationIDs) =>
            this.messagesService.getConversations(conversationIDs, {}).pipe(
                pluck('conversations', '0', 'messages', '0'),
                catchError((e) => {
                    this.hasError$.next(e);
                    return of(e);
                })
            )
        ),
        shareReplay(1)
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    error$ = this.hasError$.asObservable();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    isLoading$ = progress(this.getConversations$, merge(this.message$, this.hasError$));

    constructor(private messagesService: MessagesService) {
        this.message$.subscribe();
    }

    getMessage(conversationIDs: ConversationId[]) {
        this.getConversations$.next(conversationIDs);
    }
}
