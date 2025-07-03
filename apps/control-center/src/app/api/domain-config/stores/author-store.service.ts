import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Author, AuthorManagement } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { catchError, of } from 'rxjs';

import { KeycloakUserService } from '../../../shared/services';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    private authorManagementService = inject(AuthorManagement);
    private keycloakUserService = inject(KeycloakUserService);
    private log = inject(NotifyLogService);
    author = rxResource({
        params: () => this.keycloakUserService.user.value(),
        stream: ({ params }) =>
            this.authorManagementService.GetByEmail(params.email).pipe(
                catchError(() =>
                    this.authorManagementService
                        .Create({
                            email: params.email,
                            name: params.username,
                        })
                        .pipe(
                            catchError((err) => {
                                this.log.errorOperation(err, 'create', 'author');
                                return of<Author>({ id: '', email: '', name: '' });
                            }),
                        ),
                ),
            ),
    });
}
