import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { KeycloakService } from 'keycloak-angular';
import { of, switchMap } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
    selector: 'cc-toolbar',
    standalone: true,
    imports: [MatButtonModule, MatIconModule, MatMenuModule, MatToolbarModule, CommonModule],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
    username$ = of().pipe(
        switchMap(() => this.keycloakService.loadUserProfile()),
        map(() => this.keycloakService.getUsername()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor(private keycloakService: KeycloakService) {}

    logout() {
        void this.keycloakService.logout();
    }
}
