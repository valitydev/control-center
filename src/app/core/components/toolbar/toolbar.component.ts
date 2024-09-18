import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
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
        CdkCopyToClipboard,
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
    hasMenu$ = this.urlService.path$.pipe(map((p) => p.length <= 3));

    constructor(
        private keycloakService: KeycloakService,
        private router: Router,
        private urlService: UrlService,
        private destroyRef: DestroyRef,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit() {
        this.partyIdControl.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((partyId) => {
                const currentPartyId = this.getPartyId() || null;
                if (partyId) {
                    if (currentPartyId !== partyId) {
                        void this.router.navigate([`/party/${partyId}`]);
                    }
                } else if (currentPartyId) {
                    void this.router.navigate([`/parties`]);
                }
            });
        this.urlService.path$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((path) => {
            const partyId = this.getPartyId(path) || null;
            if (partyId !== this.partyIdControl.value) {
                this.partyIdControl.setValue(partyId);
            }
        });
    }

    logout() {
        void this.keycloakService.logout();
    }

    copyNotify(res: boolean) {
        this.snackBar.open(
            res
                ? `Party Id #${this.partyIdControl.value} copied`
                : `Party Id not copied, select and copy yourself: ${this.partyIdControl.value}`,
            'OK',
            { duration: res ? 2_000 : 60_000 },
        );
    }

    toParty() {
        void this.router.navigate([`/party/${this.partyIdControl.value}`]);
    }

    private getPartyId(path: string[] = this.urlService.path) {
        return path[0] === 'party' && path[1] ? path[1] : null;
    }
}
