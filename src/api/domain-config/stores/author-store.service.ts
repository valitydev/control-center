import { Injectable, inject } from '@angular/core';
import { AuthorManagement } from '@vality/domain-proto/domain_config_v2';
import { NotifyLogService, observableResource } from '@vality/matez';
import { catchError } from 'rxjs';

import { KeycloakUserService } from '../../../services/app-auth-guard/keycloak-user.service';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    private authorManagementService = inject(AuthorManagement);
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
