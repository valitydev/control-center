import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { UrlService } from '@vality/ng-core';
import { KeycloakService } from 'keycloak-angular';
import { from } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';

import { MerchantFieldModule } from '../../../shared/components/merchant-field';

@Component({
    selector: 'cc-toolbar',
    standalone: true,
    imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        CommonModule,
        MerchantFieldModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './toolbar.component.html',
    styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent implements OnInit {
    username$ = from(this.keycloakService.loadUserProfile()).pipe(
        map(() => this.keycloakService.getUsername()),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );
    partyIdControl = new FormControl<string>(this.getPartyId());

    constructor(
        private keycloakService: KeycloakService,
        private router: Router,
        private urlService: UrlService,
        private destroyRef: DestroyRef,
    ) {}

    ngOnInit() {
        this.partyIdControl.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((partyId) => {
                if (partyId) {
                    void this.router.navigate([`/party/${partyId}`]);
                } else {
                    void this.router.navigate([`/parties`]);
                }
            });
        this.urlService.path$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((path) => {
            const partyId = this.getPartyId(path);
            if (partyId) {
                if (partyId !== this.partyIdControl.value) {
                    this.partyIdControl.setValue(partyId, { emitEvent: false });
                }
            } else if (this.partyIdControl.value) {
                this.partyIdControl.setValue(null, { emitEvent: false });
            }
        });
    }

    logout() {
        void this.keycloakService.logout();
    }

    private getPartyId(path: string[] = this.urlService.path) {
        return path[0] === 'party' && path[1] ? path[1] : null;
    }
}
