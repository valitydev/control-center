import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Author } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService } from '@vality/matez';
import { catchError, of } from 'rxjs';

import { KeycloakUserService } from '../../../shared/services';
import { AuthorManagementService } from '../author-management.service';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    author = rxResource({
        request: () => this.keycloakUserService.user.value(),
        loader: ({ request }) =>
            this.authorManagementService.GetByEmail(request.email).pipe(
                catchError(() =>
                    this.authorManagementService
                        .Create({
                            email: request.email,
                            name: request.username,
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

    constructor(
        private authorManagementService: AuthorManagementService,
        private keycloakUserService: KeycloakUserService,
        private log: NotifyLogService,
    ) {}
}
