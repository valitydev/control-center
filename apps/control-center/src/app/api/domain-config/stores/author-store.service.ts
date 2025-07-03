import { Injectable, inject } from '@angular/core';
import { AuthorManagement } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, observableResource } from '@vality/matez';
import { catchError } from 'rxjs';

import { KeycloakUserService } from '../../../shared/services';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    private authorManagementService = inject(AuthorManagement);
    private keycloakUserService = inject(KeycloakUserService);
    private log = inject(NotifyLogService);

    author = observableResource({
        params: () => this.keycloakUserService.user.value$,
        loader: (params) =>
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
                                throw err;
                            }),
                        ),
                ),
            ),
    });
}
