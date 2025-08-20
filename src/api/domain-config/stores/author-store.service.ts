import { catchError } from 'rxjs';

import { Injectable, inject } from '@angular/core';

import { NotifyLogService, observableResource } from '@vality/matez';

import { ThriftAuthorManagementService } from '~/api/services';
import { KeycloakUserService } from '~/services';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    private authorManagementService = inject(ThriftAuthorManagementService);
    private keycloakUserService = inject(KeycloakUserService);
    private log = inject(NotifyLogService);

    author = observableResource({
        params: this.keycloakUserService.user.value$,
        loader: (user) =>
            this.authorManagementService.GetByEmail(user.email).pipe(
                catchError(() =>
                    this.authorManagementService
                        .Create({
                            email: user.email,
                            name: user.username,
                        })
                        .pipe(
                            catchError((err) => {
                                this.log.errorOperation(err, 'create', 'author');
                                throw err;
                            }),
                        ),
                ),
            ),
    });
}
