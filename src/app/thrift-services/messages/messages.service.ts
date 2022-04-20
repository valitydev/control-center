import { Injectable, NgZone } from '@angular/core';
import {
    Conversation,
    ConversationFilter,
    ConversationId,
    GetConversationResponse,
    User,
} from '@vality/messages-proto';
import {
    Conversation as ConversationType,
    ConversationFilter as ConversationFilterType,
    User as UserType,
} from '@vality/messages-proto/lib/messages/gen-nodejs/messages_types';
import * as MessageServiceClient from '@vality/messages-proto/lib/messages/gen-nodejs/MessageService';
import { Observable } from 'rxjs';

import { KeycloakTokenInfoService } from '../../keycloak-token-info.service';
import { ThriftService } from '../services/thrift/thrift-service';

@Injectable()
/**
 * @deprecated
 */
export class MessagesService extends ThriftService {
    constructor(zone: NgZone, keycloakTokenInfoService: KeycloakTokenInfoService) {
        super(zone, keycloakTokenInfoService, '/v1/messages', MessageServiceClient);
    }

    getConversations = (
        ids: ConversationId[],
        filter: ConversationFilter
    ): Observable<GetConversationResponse> =>
        this.toObservableAction('GetConversations')(ids, new ConversationFilterType(filter));

    saveConversations = (conversations: Conversation[], user: User): Observable<void> =>
        this.toObservableAction('SaveConversations')(
            conversations.map((c) => new ConversationType(c)),
            new UserType(user)
        );
}
