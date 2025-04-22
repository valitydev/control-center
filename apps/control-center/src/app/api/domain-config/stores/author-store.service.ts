import { Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs';

import { KeycloakUserService } from '../../../shared/services';
import { AuthorManagementService } from '../author-management.service';

@Injectable({
    providedIn: 'root',
})
export class AuthorStoreService {
    author = rxResource({
        request: () => this.keycloakUserService.user.value(),
        loader: ({ request }) =>
            this.authorManagementService
                .Get(request.email)
                .pipe(
                    catchError(() =>
                        this.authorManagementService.Create({
                            email: request.email,
                            name: request.username,
                        }),
                    ),
                ),
    });

    constructor(
        private authorManagementService: AuthorManagementService,
        private keycloakUserService: KeycloakUserService,
    ) {}
}
